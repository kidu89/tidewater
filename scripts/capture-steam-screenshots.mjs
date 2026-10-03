import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { access, mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { preview } from 'vite';
import { deflateSync } from 'node:zlib';

const ROOT = resolve( dirname( fileURLToPath( import.meta.url ) ), '..' );
const args = process.argv.slice( 2 );
const externalBrowser = args.includes( '--external-browser' );
const outputArg = args.find( ( arg ) => ! arg.startsWith( '--' ) );
const OUT = resolve( outputArg || join( ROOT, 'release', 'steam-gameplay-captures' ) );
const HOST = '127.0.0.1';
const GAME_PORT = 5189;
const CAPTURE_PORT = 5190;
const GAME_ORIGIN = `http://${ HOST }:${ GAME_PORT }`;
const WIDTH = 1920;
const HEIGHT = 1080;
const VIEWS = [ 'beach', 'pier', 'sunGlitter', 'sunset', 'village', 'underwater', 'shallowSeabed', 'deepBlue', 'aerial', 'palms', 'waterline', 'pierShallows', 'sunFlare', 'tHeadW', 'tValley', 'tCove', 'boatFish', 'boatHelm' ];

function pngChunk( type, data ) {

	const out = Buffer.alloc( 12 + data.length );
	out.writeUInt32BE( data.length, 0 );
	out.write( type, 4, 'ascii' );
	data.copy( out, 8 );
	out.writeUInt32BE( crc32( out.subarray( 4, 8 + data.length ) ), 8 + data.length );
	return out;

}

const crcTable = new Uint32Array( 256 ).map( ( _, n ) => {
	let c = n;
	for ( let k = 0; k < 8; k ++ ) c = c & 1 ? 0xedb88320 ^ ( c >>> 1 ) : c >>> 1;
	return c;
} );

function crc32( data ) {
	let c = 0xffffffff;
	for ( const value of data ) c = crcTable[ ( c ^ value ) & 255 ] ^ ( c >>> 8 );
	return ( c ^ 0xffffffff ) >>> 0;
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
const expectedFiles = new Set( VIEWS.map( ( view ) => `steam-${ view }.png` ) );
let resolveCaptures, rejectCaptures;
const capturesDone = new Promise( ( resolve, reject ) => {
	resolveCaptures = resolve;
	rejectCaptures = reject;
} );
const collector = createServer( async ( request, response ) => {
	if ( request.headers.origin !== GAME_ORIGIN ) {
		response.writeHead( 403 ).end();
		return;
	}
	response.setHeader( 'Access-Control-Allow-Origin', GAME_ORIGIN );
	response.setHeader( 'Access-Control-Allow-Methods', 'POST, OPTIONS' );
	response.setHeader( 'Access-Control-Allow-Headers', 'content-type' );
	response.setHeader( 'Vary', 'Origin' );
	if ( request.method === 'OPTIONS' ) {
		response.writeHead( 204 ).end();
		return;
	}
	const name = new URL( request.url, `http://${ HOST }:${ CAPTURE_PORT }` ).pathname.slice( 1 );
	const view = /^steam-([a-zA-Z]+)\.bgra$/.exec( name )?.[ 1 ];
	if ( request.method !== 'POST' || ! view || ! VIEWS.includes( view ) ) {
		response.writeHead( 404 ).end();
		return;
	}
	try {
		const chunks = [];
		let bytes = 0;
		for await ( const chunk of request ) {
			bytes += chunk.length;
			if ( bytes > WIDTH * HEIGHT * 4 + 8 ) throw new Error( 'Screenshot exceeds the expected 1920×1080 frame size.' );
			chunks.push( chunk );
		}
		const bgra = Buffer.concat( chunks );
		if ( bgra.length !== WIDTH * HEIGHT * 4 + 8 || bgra.readUInt32LE( 0 ) !== WIDTH || bgra.readUInt32LE( 4 ) !== HEIGHT ) {
			throw new Error( `Unexpected screenshot dimensions or byte count for ${ view }.` );
		}
		const file = join( OUT, `steam-${ view }.png` );
		await writeFile( file, bgraToPNG( WIDTH, HEIGHT, bgra ) );
		expectedFiles.delete( `steam-${ view }.png` );
		console.log( `Saved ${ file } (${ WIDTH }×${ HEIGHT })` );
		response.writeHead( 201 ).end();
		if ( expectedFiles.size === 0 ) resolveCaptures();
	} catch ( error ) {
		console.error( `[Steam capture] ${ error.message }` );
		response.writeHead( 400 ).end( error.message );
		rejectCaptures( error );
	}
} );

let previewServer;
let browser;
let browserProfile;
try {
	await new Promise( ( resolve, reject ) => {
		collector.once( 'error', reject );
		collector.listen( CAPTURE_PORT, HOST, resolve );
	} );
	previewServer = await preview( {
		configFile: join( ROOT, 'vite.config.js' ),
		preview: { host: HOST, port: GAME_PORT, strictPort: true },
	} );
	const gameUrl = new URL( '/', GAME_ORIGIN );
	gameUrl.searchParams.set( 'bench', '1' );
	gameUrl.searchParams.set( 'shots', VIEWS.join( ',' ) );
	gameUrl.searchParams.set( 'tag', 'steam' );
	gameUrl.searchParams.set( 'width', String( WIDTH ) );
	gameUrl.searchParams.set( 'height', String( HEIGHT ) );
	const chromePath = process.env.CHROME_PATH || null;
	let useChrome = false;
	if ( chromePath && ! externalBrowser ) {
		try { await access( chromePath ); useChrome = true; } catch { /* fall back to the bundled Electron runtime */ }
	}
	if ( externalBrowser ) {
		console.log( `[Steam capture] Open this URL in the connected browser: ${ gameUrl.href }` );
	} else if ( useChrome ) {
		browserProfile = await mkdtemp( join( ROOT, 'release', '.steam-capture-profile-' ) );
		browser = spawn( chromePath, [
			'--headless=new', '--window-size=1920,1080', '--force-device-scale-factor=1',
			'--disable-background-timer-throttling', '--disable-renderer-backgrounding',
			'--no-first-run', '--no-default-browser-check', `--user-data-dir=${ browserProfile }`, gameUrl.href,
		], { cwd: ROOT, stdio: 'inherit', windowsHide: true } );
		console.log( `[Steam capture] Using isolated Chrome profile at ${ browserProfile }.` );
	} else {
		const { createRequire } = await import( 'node:module' );
		const electronPath = createRequire( import.meta.url )( 'electron' );
		const mainFile = join( ROOT, 'scripts', 'steam-screenshot-window.cjs' );
		browser = spawn( electronPath, [ mainFile, gameUrl.href ], { cwd: ROOT, stdio: 'inherit', windowsHide: false } );
	}
	if ( browser ) {
		browser.once( 'error', rejectCaptures );
		browser.once( 'exit', ( code ) => {
			if ( expectedFiles.size ) rejectCaptures( new Error( `Screenshot window exited before all captures arrived (code ${ code }).` ) );
		} );
	}
	const timeout = setTimeout( () => rejectCaptures( new Error( 'Timed out waiting for the WebGPU screenshots. Check the visible game window and its startup error.' ) ), 360000 );
	try {
		await capturesDone;
		await new Promise( ( resolve ) => setTimeout( resolve, 500 ) );
	} finally {
		clearTimeout( timeout );
	}
	console.log( `Captured ${ VIEWS.length } real game frames at 1920×1080.` );
} finally {
	if ( browser && browser.exitCode === null ) {
		browser.kill();
		await new Promise( ( resolve ) => {
			const timeout = setTimeout( resolve, 10000 );
			browser.once( 'exit', () => { clearTimeout( timeout ); resolve(); } );
		} );
	}
	if ( browserProfile ) {
		if ( dirname( browserProfile ) !== resolve( ROOT, 'release' ) ) throw new Error( 'Refusing to remove the Chrome profile outside the release workspace.' );
		await rm( browserProfile, { recursive: true, force: true } );
	}
	await new Promise( ( resolve ) => collector.close( resolve ) );
	if ( previewServer ) await previewServer.close();
}
