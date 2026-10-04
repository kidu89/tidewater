import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { preview } from 'vite';
import { deflateSync } from 'node:zlib';

const ROOT = resolve( dirname( fileURLToPath( import.meta.url ) ), '..' );
const OUT = resolve( ROOT, 'release', 'mobile-scenes-portrait-source' );
const HOST = '127.0.0.1';
const GAME_PORT = 5189;
const CAPTURE_PORT = 5190;
const GAME_ORIGIN = `http://${ HOST }:${ GAME_PORT }`;
const WIDTH = 1080;
const HEIGHT = 2400;
const VIEWS = [ 'mobilePier', 'mobileCay', 'mobileReef', 'mobileDeep', 'mobileMangrove', 'mobileAtoll' ];

function crc32( data ) {
	let c = 0xffffffff;
	for ( const value of data ) {
		c ^= value;
		for ( let k = 0; k < 8; k ++ ) c = c & 1 ? 0xedb88320 ^ ( c >>> 1 ) : c >>> 1;
	}
	return ( c ^ 0xffffffff ) >>> 0;
}

function pngChunk( type, data ) {
	const out = Buffer.alloc( 12 + data.length );
	out.writeUInt32BE( data.length, 0 );
	out.write( type, 4, 'ascii' );
	data.copy( out, 8 );
	out.writeUInt32BE( crc32( out.subarray( 4, 8 + data.length ) ), 8 + data.length );
	return out;
}

function bgraToPNG( width, height, bgra ) {
	const rowSize = width * 4;
	const raw = Buffer.alloc( ( rowSize + 1 ) * height );
	for ( let y = 0; y < height; y ++ ) {
		const source = 8 + y * rowSize;
		const target = y * ( rowSize + 1 );
		for ( let x = 0; x < width; x ++ ) {
			const i = source + x * 4, o = target + 1 + x * 4;
			raw[ o ] = bgra[ i + 2 ];
			raw[ o + 1 ] = bgra[ i + 1 ];
			raw[ o + 2 ] = bgra[ i ];
			raw[ o + 3 ] = bgra[ i + 3 ];
		}
	}
	const header = Buffer.alloc( 13 );
	header.writeUInt32BE( width, 0 );
	header.writeUInt32BE( height, 4 );
	header[ 8 ] = 8;
	header[ 9 ] = 6;
	return Buffer.concat( [
		Buffer.from( [ 137, 80, 78, 71, 13, 10, 26, 10 ] ),
		pngChunk( 'IHDR', header ),
		pngChunk( 'IDAT', deflateSync( raw ) ),
		pngChunk( 'IEND', Buffer.alloc( 0 ) ),
	] );
}

await mkdir( OUT, { recursive: true } );
const expected = new Set( VIEWS.map( ( name ) => `mobile-${ name }.png` ) );
let resolveDone, rejectDone;
const done = new Promise( ( resolve, reject ) => { resolveDone = resolve; rejectDone = reject; } );
const collector = createServer( async ( request, response ) => {
	if ( request.headers.origin !== GAME_ORIGIN ) { response.writeHead( 403 ).end(); return; }
	response.setHeader( 'Access-Control-Allow-Origin', GAME_ORIGIN );
	response.setHeader( 'Access-Control-Allow-Methods', 'POST, OPTIONS' );
	response.setHeader( 'Access-Control-Allow-Headers', 'content-type' );
	response.setHeader( 'Vary', 'Origin' );
	if ( request.method === 'OPTIONS' ) { response.writeHead( 204 ).end(); return; }
	const name = new URL( request.url, `http://${ HOST }:${ CAPTURE_PORT }` ).pathname.slice( 1 );
	if ( request.method !== 'POST' || ! /^mobile-[A-Za-z]+\.bgra$/.test( name ) || ! expected.has( name.replace( '.bgra', '.png' ) ) ) {
		response.writeHead( 404 ).end(); return;
	}
	try {
		const chunks = [];
		let bytes = 0;
		for await ( const chunk of request ) {
			bytes += chunk.length;
			if ( bytes > WIDTH * HEIGHT * 4 + 8 ) throw new Error( 'A screenshot exceeded the expected portrait frame size.' );
			chunks.push( chunk );
		}
		const bgra = Buffer.concat( chunks );
		if ( bgra.length !== WIDTH * HEIGHT * 4 + 8 || bgra.readUInt32LE( 0 ) !== WIDTH || bgra.readUInt32LE( 4 ) !== HEIGHT ) {
			throw new Error( `Unexpected screenshot dimensions or byte count for ${ name }.` );
		}
		const fileName = name.replace( '.bgra', '.png' );
		await writeFile( join( OUT, fileName ), bgraToPNG( WIDTH, HEIGHT, bgra ) );
		expected.delete( fileName );
		console.log( `Saved ${ fileName } (${ WIDTH }×${ HEIGHT })` );
		response.writeHead( 201 ).end();
		if ( expected.size === 0 ) resolveDone();
	} catch ( error ) {
		console.error( `[Mobile scene capture] ${ error.message }` );
		response.writeHead( 400 ).end( error.message );
		rejectDone( error );
	}
} );

let server, browser, profile;
try {
	await new Promise( ( resolve, reject ) => { collector.once( 'error', reject ); collector.listen( CAPTURE_PORT, HOST, resolve ); } );
	server = await preview( { configFile: join( ROOT, 'vite.config.js' ), preview: { host: HOST, port: GAME_PORT, strictPort: true } } );
	const gameUrl = new URL( '/', GAME_ORIGIN );
	gameUrl.searchParams.set( 'bench', '1' );
	gameUrl.searchParams.set( 'shots', VIEWS.join( ',' ) );
	gameUrl.searchParams.set( 'tag', 'mobile' );
	gameUrl.searchParams.set( 'width', String( WIDTH ) );
	gameUrl.searchParams.set( 'height', String( HEIGHT ) );
	const { createRequire } = await import( 'node:module' );
	const electronPath = createRequire( import.meta.url )( 'electron' );
	profile = await mkdtemp( join( ROOT, 'release', '.mobile-capture-profile-' ) );
	browser = spawn( electronPath, [ join( ROOT, 'scripts', 'steam-screenshot-window.cjs' ), gameUrl.href ], { cwd: ROOT, stdio: 'inherit', windowsHide: false, env: { ...process.env, ELECTRON_USER_DATA_DIR: profile } } );
	browser.once( 'error', rejectDone );
	browser.once( 'exit', ( code ) => { if ( expected.size ) rejectDone( new Error( `Capture window closed before all scenes arrived (code ${ code }).` ) ); } );
	const timeout = setTimeout( () => rejectDone( new Error( 'Timed out waiting for the portrait game renders.' ) ), 360000 );
	try { await done; await new Promise( ( resolve ) => setTimeout( resolve, 500 ) ); }
	finally { clearTimeout( timeout ); }
	console.log( `Captured ${ VIEWS.length } real game views at ${ WIDTH }×${ HEIGHT } into ${ OUT }.` );
} finally {
	if ( browser && browser.exitCode === null ) {
		browser.kill();
		await new Promise( ( resolve ) => { const timeout = setTimeout( resolve, 10000 ); browser.once( 'exit', () => { clearTimeout( timeout ); resolve(); } ); });
	}
	if ( profile ) {
		if ( dirname( profile ) !== resolve( ROOT, 'release' ) ) throw new Error( 'Refusing to remove the Electron profile outside release/.' );
		await rm( profile, { recursive: true, force: true } );
	}
	await new Promise( ( resolve ) => collector.close( resolve ) );
	if ( server ) await server.close();
}