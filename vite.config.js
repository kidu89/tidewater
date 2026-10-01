import { defineConfig } from 'vite';

export default defineConfig( {
	// Relative paths let the app load the complete bundle from its packaged assets and local address.
	base: './',
	build: { target: 'chrome80', chunkSizeWarningLimit: 4000 },
	server: { port: 5188, strictPort: true, host: '127.0.0.1' },
} );
