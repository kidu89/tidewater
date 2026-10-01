const { app, BrowserWindow, shell } = require( 'electron' );
const fs = require( 'node:fs' );
const http = require( 'node:http' );
const path = require( 'node:path' );

const HOST = '127.0.0.1';
const MIME = {
	'.avif': 'image/avif', '.bin': 'application/octet-stream', '.css': 'text/css; charset=utf-8',
	'.glb': 'model/gltf-binary', '.gltf': 'model/gltf+json', '.html': 'text/html; charset=utf-8',
	'.jpeg': 'image/jpeg', '.jpg': 'image/jpeg', '.js': 'text/javascript; charset=utf-8',
	'.json': 'application/json; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
	'.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.otf': 'font/otf', '.png': 'image/png',
	'.svg': 'image/svg+xml', '.ttf': 'font/ttf', '.txt': 'text/plain; charset=utf-8',
	'.wasm': 'application/wasm', '.wav': 'audio/wav', '.webp': 'image/webp', '.woff': 'font/woff', '.woff2': 'font/woff2',
};

let server;
let gameOrigin;

function safePath( requestUrl, webRoot ) {
	let pathname;
	try {
		pathname = decodeURIComponent( new URL( requestUrl, gameOrigin ).pathname );
	} catch {
		return null;
	}
	if ( pathname.includes( '\0' ) ) return null;
	if ( pathname === '/' ) pathname = '/index.html';
	const file = path.resolve( webRoot, `.${ pathname }` );
	const relative = path.relative( webRoot, file );
	if ( relative === '..' || relative.startsWith( `..${ path.sep }` ) || path.isAbsolute( relative ) ) return null;
	return file;
}

function createAssetServer() {
	const webRoot = path.join( app.getAppPath(), 'dist' );
	server = http.createServer( ( request, response ) => {
		const remote = request.socket.remoteAddress;
		if ( remote !== '127.0.0.1' && remote !== '::1' && remote !== '::ffff:127.0.0.1' ) {
			response.writeHead( 403 ).end();
			return;
		}
		if ( request.method !== 'GET' && request.method !== 'HEAD' ) {
			response.writeHead( 405, { Allow: 'GET, HEAD' } ).end();
			return;
		}
		const file = safePath( request.url, webRoot );
		if ( ! file ) {
			response.writeHead( 400 ).end();
			return;
		}
		fs.stat( file, ( error, stat ) => {
			if ( error || ! stat.isFile() ) {
				response.writeHead( 404 ).end();
				return;
			}
			response.writeHead( 200, {
				'Cache-Control': 'no-store',
				'Content-Length': stat.size,
				'Content-Security-Policy': [
					"default-src 'self' data: blob:",
					"script-src 'self' 'wasm-unsafe-eval'",
					"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
					"font-src 'self' data: https://fonts.gstatic.com",
					"img-src 'self' data: blob:",
					"media-src 'self' blob:",
					"connect-src 'self' https: wss:",
					"worker-src 'self' blob:",
					"object-src 'none'",
					"base-uri 'self'",
					"frame-src 'none'",
				].join( '; ' ),
				'Content-Type': MIME[ path.extname( file ).toLowerCase() ] || 'application/octet-stream',
				'X-Content-Type-Options': 'nosniff',
				'X-Frame-Options': 'DENY',
			} );
			if ( request.method === 'HEAD' ) response.end();
			else fs.createReadStream( file ).on( 'error', () => response.destroy() ).pipe( response );
		} );
	} );
	return new Promise( ( resolve, reject ) => {
		server.once( 'error', reject );
		server.listen( 0, HOST, () => {
			server.removeListener( 'error', reject );
			const address = server.address();
			gameOrigin = `http://${ HOST }:${ address.port }`;
			resolve();
		} );
	} );
}

function openGameWindow() {
	const window = new BrowserWindow( {
		width: 1600,
		height: 960,
		minWidth: 960,
		minHeight: 640,
		show: false,
		autoHideMenuBar: true,
		backgroundColor: '#02070c',
		title: 'Fishing Free',
		webPreferences: {
			contextIsolation: true,
			nodeIntegration: false,
			sandbox: true,
			webSecurity: true,
			spellcheck: false,
		},
	} );
	window.once( 'ready-to-show', () => window.show() );
	window.webContents.setWindowOpenHandler( ( { url } ) => {
		try {
			if ( new URL( url ).protocol === 'https:' ) shell.openExternal( url );
		} catch { /* Ignore invalid external links. */ }
		return { action: 'deny' };
	} );
	window.webContents.on( 'will-navigate', ( event, url ) => {
		if ( url.startsWith( `${ gameOrigin }/` ) ) return;
		event.preventDefault();
		try {
			if ( new URL( url ).protocol === 'https:' ) shell.openExternal( url );
		} catch { /* Ignore invalid external links. */ }
	} );
	window.loadURL( `${ gameOrigin }/` );
}

app.whenReady().then( async () => {
	app.setName( 'Fishing Free' );
	await createAssetServer();
	openGameWindow();
	app.on( 'activate', () => {
		if ( BrowserWindow.getAllWindows().length === 0 ) openGameWindow();
	} );
} ).catch( ( error ) => {
	console.error( '[Fishing Free] Could not start the desktop game.', error );
	app.quit();
} );

app.on( 'window-all-closed', () => {
	if ( process.platform !== 'darwin' ) app.quit();
} );

app.on( 'before-quit', () => {
	server?.close();
} );
