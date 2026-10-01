import { copyFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath( new URL( '../', import.meta.url ) );
const destination = path.join( root, 'dist', 'legal' );
await mkdir( destination, { recursive: true } );
for ( const filename of [ 'LICENSE', 'CREDITS.md' ] ) {
	await copyFile( path.join( root, filename ), path.join( destination, filename ) );
}
