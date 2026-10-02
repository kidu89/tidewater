import './core/BenchSeed.js';

// ?bench runs in background tabs too (automation): rAF does not fire in a hidden page.
if ( /[?&]bench\b/.test( location.search ) ) {

	const raf = window.requestAnimationFrame.bind( window ), caf = window.cancelAnimationFrame.bind( window );
	window.requestAnimationFrame = ( cb ) => document.visibilityState === 'hidden' ? setTimeout( () => cb( performance.now() ), 16 ) : raf( cb );
	window.cancelAnimationFrame = ( id ) => ( clearTimeout( id ), caf( id ) );

}

const bench = /[?&]bench\b/.test( location.search );
const WEBGPU_PROBE_TIMEOUT_MS = 10000;

if ( ! bench && ! import.meta.env.DEV && 'serviceWorker' in navigator ) {
	navigator.serviceWorker.register( `${ import.meta.env.BASE_URL }sw.js`, { scope: import.meta.env.BASE_URL } )
		.catch( ( error ) => console.warn( '[Fishing Free] Offline cache could not be enabled.', error ) );
}

function browserGraphicsDetails( reason = '' ) {

	const ua = navigator.userAgent || '';
	const android = ua.match( /Android\s+([\d.]+)/i );
	const chromium = ua.match( /(?:Chrome|Chromium|CriOS)\/([\d.]+)/i );
	const webkit = ua.match( /Version\/([\d.]+)/i );
	const probe = globalThis.__fishingFreeWebGPUProbe || {};
	return {
		mode: /;\s*wv\)/i.test( ua ) ? 'Android WebView' : /Android/i.test( ua ) ? 'Android browser' : /iPhone|iPad|iPod/i.test( ua ) ? 'iOS browser' : 'Browser',
		osVersion: android ? `Android ${ android[ 1 ] }` : /iPhone|iPad|iPod/i.test( ua ) ? 'iOS (version not exposed)' : 'Not reported',
		engineVersion: chromium ? `Chromium ${ chromium[ 1 ] }` : webkit ? `WebKit ${ webkit[ 1 ] }` : 'Not reported',
		secureContext: globalThis.isSecureContext ? 'Yes' : 'No',
		webgpuApi: navigator.gpu ? 'Available' : 'Not exposed',
		adapterProbe: probe.result || ( navigator.gpu ? 'Not run' : 'Not available' ),
		adapterAttempts: Array.isArray( probe.attempts ) && probe.attempts.length ? probe.attempts.join( '; ' ) : 'No adapter attempts recorded',
		reason: reason || probe.startupError || 'No fallback reason recorded',
	};

}

const loaderArt = document.querySelector( '.loader-art' );
if ( loaderArt ) {
	const showArt = () => loaderArt.classList.add( 'is-in' );
	if ( loaderArt.complete && loaderArt.naturalWidth > 0 ) showArt();
	else loaderArt.addEventListener( 'load', showArt, { once: true } );
}

async function findWebGPUAdapter() {

	if ( ! navigator.gpu ) return null;
	const deadline = performance.now() + WEBGPU_PROBE_TIMEOUT_MS;
	const probe = globalThis.__fishingFreeWebGPUProbe = { attempts: [], result: 'Searching for a graphics adapter.' };
	const androidVersion = Number( navigator.userAgent.match( /Android\s+(\d+)/i )?.[ 1 ] || 0 );
	const coreOptions = [
		[ 'High-performance', { powerPreference: 'high-performance' } ], [ 'Default', {} ], [ 'Low-power', { powerPreference: 'low-power' } ],
	];
	const compatibilityOptions = [
		[ 'Compatibility high-performance', { featureLevel: 'compatibility', powerPreference: 'high-performance' } ],
		[ 'Compatibility', { featureLevel: 'compatibility' } ],
	];
	// Android 10/11 devices may expose WebGPU through Chrome's OpenGL ES compatibility
	// backend rather than core Vulkan. Try that first so a slow core request cannot starve it.
	const optionsToTry = androidVersion > 0 && androidVersion < 12
		? [ ...compatibilityOptions, ...coreOptions ]
		: [ ...coreOptions, ...compatibilityOptions ];
	for ( const [ label, options ] of optionsToTry ) {
		const remaining = deadline - performance.now();
		if ( remaining <= 0 ) {
			probe.result = 'The adapter search reached its 10-second time limit.';
			return null;
		}
		const isOlderAndroidCompatibilityAttempt = androidVersion > 0 && androidVersion < 12 && label.startsWith( 'Compatibility' );
		// The OpenGL ES compatibility adapter can take longer to initialize on Android 10/11.
		// Give that path more time without extending the overall 10-second probe deadline.
		const attemptTimeoutMs = isOlderAndroidCompatibilityAttempt ? 4500 : 2500;
		let timeout;
		let timedOut = false;

		try {
			// Keep one stalled backend probe from consuming the full search window. This
			// leaves time for the remaining backend and power-preference combinations.
			const adapter = await Promise.race( [
				navigator.gpu.requestAdapter( options ),
				new Promise( ( resolve ) => { timeout = setTimeout( () => { timedOut = true; resolve( null ); }, Math.min( attemptTimeoutMs, remaining ) ); } ),
			] );
			if ( adapter ) {
				probe.attempts.push( `${ label }: adapter found` );
				probe.result = 'Adapter found.';
				return adapter;
			}
			probe.attempts.push( `${ label }: ${ timedOut ? 'timed out' : 'no adapter' }` );
		} catch ( error ) {
			probe.attempts.push( `${ label }: request rejected${ error?.name ? ` (${ error.name })` : '' }` );
			// Keep trying without a preference for Android WebViews that reject adapter options.
		} finally {
			clearTimeout( timeout );
		}

	}
	probe.result = 'No compatible adapter was returned.';
	return null;

}

function startPhoneMode( reason ) {

	console.info( '[Fishing Free] Starting phone fishing mode:', reason );
	const loader = document.getElementById( 'loader' );
	loader?.classList.add( 'tw-hidden' );
	const fps = document.getElementById( 'fps' );
	if ( fps ) fps.style.display = 'none';
	return import( './mobile/CanvasFishingGame.js' ).then( ( { CanvasFishingGame } ) => {

		const game = new CanvasFishingGame( document.getElementById( 'app' ), { reason, graphicsDetails: browserGraphicsDetails( reason ) } );
		game.start();
		window.__phoneGame = game;
		return game;

	} );

}

async function startWebGPUGame() {

	const [ { App }, { UI }, { AppUI }, { TouchControls } ] = await Promise.all( [
		import( './App.js' ), import( './ui/UI.js' ), import( './ui/AppUI.js' ), import( './mobile/TouchControls.js' ),
	] );
	const ui = new UI();
	const app = new App();
	window.__ui = ui;

	try {

		await app.init( ( p, text, until ) => ui.setLoading( p, text, until ) );
		app.ui = new AppUI( app, ui );
		app.touchControls = new TouchControls( app.input );
		ui.setLoading( 1, 'Ready' );
		await ui.hideLoader();
		// frame-time benchmark and reference shots (see core/Bench.js): it drives the frames itself.
		if ( app.qs.has( 'bench' ) ) {

			window.__bench = new ( await import( './core/Bench.js' ) ).Bench( app );
			if ( app.qs.has( 'auto' ) ) window.__job = window.__bench.auto( app.qs.get( 'auto' ), { runs: Number( app.qs.get( 'runs' ) ) || 1 } );
			if ( app.qs.has( 'wdbg' ) && app.waterMaterial ) app.waterMaterial.debugMode.value = Number( app.qs.get( 'wdbg' ) );
			if ( app.qs.has( 'shots' ) ) window.__job = window.__bench.shots( app.qs.get( 'shots' ).split( ',' ), {
				tag: app.qs.get( 'tag' ) || 'shot', dt: Number( app.qs.get( 'dt' ) ) || 0,
				seq: Number( app.qs.get( 'seq' ) ) || 1, every: Number( app.qs.get( 'every' ) ) || 1,
			} );

		} else app.start();
		ui.showStartOverlay( () => {

			if ( ! app.isTouchDevice ) app.input.requestLock();
			if ( app.audio ) app.audio.resume();

		} );

	} catch ( error ) {

		console.error( '[Fishing Free] WebGPU game could not start; switching to the phone mode.', error );
		globalThis.__fishingFreeWebGPUProbe ||= { attempts: [], result: 'An adapter was found, but renderer startup failed.' };
		globalThis.__fishingFreeWebGPUProbe.startupError = error.message;
		if ( bench ) {

			ui.setLoadingError( 'WebGPU game could not start: ' + error.message );
			return;

		}
		await startPhoneMode( error.message || 'WebGPU is unavailable on this device.' );

	}

}

async function start() {

	if ( bench ) return startWebGPUGame();
	if ( ! navigator.gpu ) return startPhoneMode( 'This browser does not expose WebGPU.' );
	const adapter = await findWebGPUAdapter();
	if ( ! adapter ) return startPhoneMode( 'WebGPU is present but could not create a graphics adapter.' );
	// Hand the preflight adapter to the renderer so it is not requested twice.
	globalThis.__fishingFreeWebGPUAdapter = adapter;
	return startWebGPUGame();

}

start().catch( ( error ) => {

	console.error( '[Fishing Free] Startup failed.', error );
	if ( bench ) return;
	startPhoneMode( error.message || 'The 3D renderer could not start.' ).catch( ( fallbackError ) => {

		console.error( '[Fishing Free] Phone mode failed to start.', fallbackError );
		const loader = document.getElementById( 'loader' );
		if ( ! loader ) return;
		loader.classList.remove( 'tw-hidden' );
		const status = loader.querySelector( '.loader-status' );
		if ( status ) status.textContent = 'The phone fishing mode could not start. Please close and reopen Fishing Free.';

	} );

} );
