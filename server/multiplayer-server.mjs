import { createServer } from 'node:http';
import { randomBytes } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FISH, fishLengthCm } from '../src/game/FishTable.js';

const PORT = Number( process.env.PORT ) || 8787;
const STORE_PATH = resolve( process.env.FISHING_FREE_DUEL_STORE || fileURLToPath( new URL( './duels.json', import.meta.url ) ) );
const allowedOrigins = ( process.env.CORS_ORIGINS || '*' ).split( ',' ).map( ( value ) => value.trim() ).filter( Boolean );
const DUEL_TTL_MS = 90 * 24 * 60 * 60 * 1000;
const MAX_RECORDS = 50000;
const MAX_BODY = 2048;
const RATE_WINDOW_MS = 60 * 1000;
const RATE_LIMIT = 60;

let duels = {};
let writeQueue = Promise.resolve();
const rate = new Map();

try {
	const saved = JSON.parse( await readFile( STORE_PATH, 'utf8' ) );
	if ( saved && typeof saved === 'object' && ! Array.isArray( saved ) ) duels = saved;
} catch ( error ) {
	if ( error.code !== 'ENOENT' ) console.warn( 'Could not read the duel store; starting empty.', error.message );
}

function cors( req, res ) {
	const origin = req.headers.origin;
	if ( allowedOrigins.includes( '*' ) ) res.setHeader( 'Access-Control-Allow-Origin', '*' );
	else if ( origin && allowedOrigins.includes( origin ) ) res.setHeader( 'Access-Control-Allow-Origin', origin );
	else if ( origin ) return false;
	res.setHeader( 'Vary', 'Origin' );
	res.setHeader( 'Access-Control-Allow-Methods', 'GET, POST, OPTIONS' );
	res.setHeader( 'Access-Control-Allow-Headers', 'Content-Type' );
	res.setHeader( 'Cache-Control', 'no-store' );
	return true;
}

function send( res, status, data ) {
	res.writeHead( status, { 'Content-Type': 'application/json; charset=utf-8', 'X-Content-Type-Options': 'nosniff' } );
	res.end( JSON.stringify( data ) );
}

async function bodyJSON( req ) {
	let size = 0;
	const chunks = [];
	for await ( const chunk of req ) {
		size += chunk.length;
		if ( size > MAX_BODY ) throw Object.assign( new Error( 'Request body is too large.' ), { status: 413 } );
		chunks.push( chunk );
	}
	try { return JSON.parse( Buffer.concat( chunks ).toString( 'utf8' ) ); }
	catch { throw Object.assign( new Error( 'Expected a JSON request body.' ), { status: 400 } ); }
}

function allowRequest( req ) {
	const key = req.socket.remoteAddress || 'unknown';
	const now = Date.now();
	let entry = rate.get( key );
	if ( ! entry || now - entry.start >= RATE_WINDOW_MS ) entry = { start: now, count: 0 };
	entry.count ++;
	rate.set( key, entry );
	if ( rate.size > 5000 ) for ( const [ ip, value ] of rate ) if ( now - value.start >= RATE_WINDOW_MS ) rate.delete( ip );
	return entry.count <= RATE_LIMIT;
}

function readCatch( input, expectedSpecies = null ) {
	if ( ! input || typeof input.species !== 'string' || ! Object.hasOwn( FISH, input.species ) ) return null;
	if ( expectedSpecies && input.species !== expectedSpecies ) return null;
	const fish = FISH[ input.species ];
	if ( ! Number.isFinite( input.kg ) || input.kg < fish.kg[ 0 ] - 0.01 || input.kg > fish.kg[ 1 ] + 0.01 ) return null;
	const kg = Math.round( input.kg * 100 ) / 100;
	return { species: input.species, kg, cm: Math.round( fishLengthCm( input.species, kg ) ) };
}

async function save() {
	const snapshot = JSON.stringify( duels );
	writeQueue = writeQueue.catch( () => {} ).then( async () => {
		await mkdir( dirname( STORE_PATH ), { recursive: true } );
		const tempPath = `${ STORE_PATH }.tmp`;
		await writeFile( tempPath, snapshot, 'utf8' );
		await rename( tempPath, STORE_PATH );
	} );
	await writeQueue;
}

function prune() {
	const now = Date.now();
	for ( const [ id, duel ] of Object.entries( duels ) ) if ( ! duel || duel.expiresAt <= now ) delete duels[ id ];
	const ids = Object.keys( duels );
	if ( ids.length > MAX_RECORDS ) {
		ids.sort( ( a, b ) => duels[ a ].createdAt - duels[ b ].createdAt );
		for ( const id of ids.slice( 0, ids.length - MAX_RECORDS ) ) delete duels[ id ];
	}
}

function publicDuel( duel ) {
	return {
		id: duel.id,
		status: duel.guestCatch ? 'complete' : 'open',
		species: duel.hostCatch.species,
		hostCatch: duel.hostCatch,
		guestCatch: duel.guestCatch,
		createdAt: duel.createdAt,
		expiresAt: duel.expiresAt,
		...( duel.guestCatch ? { winner: duel.guestCatch.kg > duel.hostCatch.kg ? 'friend' : duel.guestCatch.kg < duel.hostCatch.kg ? 'host' : 'tie' } : {} ),
	};
}

const server = createServer( async ( req, res ) => {
	if ( ! cors( req, res ) ) return send( res, 403, { error: 'This game origin is not allowed.' } );
	if ( req.method === 'OPTIONS' ) { res.writeHead( 204 ); return res.end(); }
	if ( ! allowRequest( req ) ) return send( res, 429, { error: 'Too many requests. Try again in a minute.' } );

	const url = new URL( req.url, 'http://localhost' );
	if ( req.method === 'GET' && url.pathname === '/health' ) return send( res, 200, { ok: true, service: 'fishing-free-duels' } );

	try {
		if ( req.method === 'POST' && url.pathname === '/api/duels' ) {
			const catchData = readCatch( await bodyJSON( req ) );
			if ( ! catchData ) return send( res, 422, { error: 'The catch species or weight is invalid.' } );
			prune();
			const id = randomBytes( 18 ).toString( 'base64url' );
			const createdAt = Date.now();
			duels[ id ] = { id, hostCatch: catchData, guestCatch: null, createdAt, expiresAt: createdAt + DUEL_TTL_MS };
			await save();
			return send( res, 201, publicDuel( duels[ id ] ) );
		}

		const route = url.pathname.match( /^\/api\/duels\/([A-Za-z0-9_-]{20,32})(?:\/(result))?$/ );
		if ( route ) {
			const duel = duels[ route[ 1 ] ];
			if ( ! duel || duel.expiresAt <= Date.now() ) return send( res, 404, { error: 'This duel was not found or has expired.' } );
			if ( req.method === 'GET' && ! route[ 2 ] ) return send( res, 200, publicDuel( duel ) );
			if ( req.method === 'POST' && route[ 2 ] ) {
				const catchData = readCatch( await bodyJSON( req ), duel.hostCatch.species );
				if ( ! catchData ) return send( res, 422, { error: 'Catch the same species as the challenge to submit a result.' } );
				if ( duel.guestCatch ) {
					if ( duel.guestCatch.kg === catchData.kg && duel.guestCatch.cm === catchData.cm ) return send( res, 200, publicDuel( duel ) );
					return send( res, 409, { error: 'A result has already been submitted for this duel.', duel: publicDuel( duel ) } );
				}
				duel.guestCatch = catchData;
				await save();
				return send( res, 200, publicDuel( duel ) );
			}
		}

		return send( res, 404, { error: 'Route not found.' } );
	} catch ( error ) {
		if ( res.headersSent ) return res.destroy();
		console.error( 'Duel API request failed:', error );
		return send( res, error.status || 500, { error: error.status ? error.message : 'The duel service could not complete that request.' } );
	}
} );

server.listen( PORT, '0.0.0.0', () => console.log( `Fishing Free duel API listening on port ${ PORT }` ) );
