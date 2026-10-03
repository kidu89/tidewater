import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath( new URL( '../', import.meta.url ) );
const destination = path.join( root, 'dist', 'legal' );
await mkdir( destination, { recursive: true } );
for ( const filename of [ 'LICENSE', 'CREDITS.md' ] ) {
	await copyFile( path.join( root, filename ), path.join( destination, filename ) );
}

// A versioned cache name makes installed PWAs and Android WebViews discard stale startup assets.
const appVersion = JSON.parse( await readFile( path.join( root, 'package.json' ), 'utf8' ) ).version;
const serviceWorkerPath = path.join( root, 'dist', 'sw.js' );
const serviceWorker = await readFile( serviceWorkerPath, 'utf8' );
if ( ! serviceWorker.includes( '__APP_VERSION__' ) ) throw new Error( 'The service-worker cache version placeholder is missing.' );
await writeFile( serviceWorkerPath, serviceWorker.replaceAll( '__APP_VERSION__', appVersion ) );
