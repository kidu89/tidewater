import { defineConfig } from 'vite';
import { readFileSync } from 'node:fs';

const packageJson = JSON.parse( readFileSync( new URL( './package.json', import.meta.url ), 'utf8' ) );

export default defineConfig( {
	// Native packages use relative paths; GitHub Pages sets /tidewater/ so its PWA stays in scope.
	base: process.env.VITE_BASE_PATH || './',
	define: { __FISHING_FREE_VERSION__: JSON.stringify( packageJson.version ) },
	build: { target: 'chrome80', chunkSizeWarningLimit: 4000 },
	server: { port: 5188, strictPort: true, host: '127.0.0.1' },
} );
