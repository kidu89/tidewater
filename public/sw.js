const CACHE_PREFIX = 'fishing-free-shell-';
const CACHE_NAME = `${ CACHE_PREFIX }1.0.15`;
const APP_SCOPE = self.registration.scope;

self.addEventListener( 'install', ( event ) => {
	event.waitUntil( ( async () => {
		const cache = await caches.open( CACHE_NAME );
		await cache.addAll( [
			APP_SCOPE,
			new URL( 'manifest.webmanifest', APP_SCOPE ).href,
			new URL( 'icons/icon-192.png', APP_SCOPE ).href,
		] );
		await self.skipWaiting();
	} )() );
} );

self.addEventListener( 'activate', ( event ) => {
	event.waitUntil( ( async () => {
		const names = await caches.keys();
		await Promise.all( names.filter( ( name ) => name.startsWith( CACHE_PREFIX ) && name !== CACHE_NAME ).map( ( name ) => caches.delete( name ) ) );
		await self.clients.claim();
	} )() );
} );

self.addEventListener( 'fetch', ( event ) => {
	const request = event.request;
	if ( request.method !== 'GET' ) return;

	const url = new URL( request.url );
	if ( url.origin !== self.location.origin || ! url.href.startsWith( APP_SCOPE ) ) return;

	if ( request.mode === 'navigate' ) {
		event.respondWith( ( async () => {
			try {
				const response = await fetch( request );
				if ( response.ok && response.type === 'basic' ) {
					const cache = await caches.open( CACHE_NAME );
					try { await cache.put( APP_SCOPE, response.clone() ); } catch {}
				}
				return response;
			} catch {
				return ( await caches.match( APP_SCOPE ) ) || Response.error();
			}
		} )() );
		return;
	}

	if ( ! /\.(?:js|css|html|json|webmanifest|glb|gltf|bin|png|jpe?g|webp|ktx2|wasm|ogg|mp3|woff2?)$/i.test( url.pathname ) ) return;

	event.respondWith( ( async () => {
		const cache = await caches.open( CACHE_NAME );
		const cached = await cache.match( request, { ignoreSearch: true } );
		if ( cached ) {
			event.waitUntil( fetch( request ).then( async ( response ) => {
				if ( response.ok && response.type === 'basic' ) await cache.put( request, response );
			} ).catch( () => {} ) );
			return cached;
		}

		const response = await fetch( request );
		if ( response.ok && response.type === 'basic' ) {
			try { await cache.put( request, response.clone() ); } catch {}
		}
		return response;
	} )() );
} );

