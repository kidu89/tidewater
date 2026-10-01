import { defineConfig } from 'vite';

export default defineConfig( {
	// Native packages use relative paths; GitHub Pages sets /tidewater/ so its PWA stays in scope.
	base: process.env.VITE_BASE_PATH || './',
	build: { target: 'chrome80', chunkSizeWarningLimit: 4000 },
	server: { port: 5188, strictPort: true, host: '127.0.0.1' },
} );
