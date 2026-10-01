import './core/BenchSeed.js';

// ?bench runs in background tabs too (automation): rAF does not fire in a hidden page.
if ( /[?&]bench\b/.test( location.search ) ) {

	const raf = window.requestAnimationFrame.bind( window ), caf = window.cancelAnimationFrame.bind( window );
	window.requestAnimationFrame = ( cb ) => document.visibilityState === 'hidden' ? setTimeout( () => cb( performance.now() ), 16 ) : raf( cb );
	window.cancelAnimationFrame = ( id ) => ( clearTimeout( id ), caf( id ) );

}

const bench = /[?&]bench\b/.test( location.search );

const loaderArt = document.querySelector( '.loader-art' );
if ( loaderArt ) {
	const showArt = () => loaderArt.classList.add( 'is-in' );
	if ( loaderArt.complete && loaderArt.naturalWidth > 0 ) showArt();
	else loaderArt.addEventListener( 'load', showArt, { once: true } );
}

async function findWebGPUAdapter() {

	if ( ! navigator.gpu ) return null;
	// Prefer the full WebGPU feature level. On recent Android Chromium builds, the compatibility
	// level can also expose a GPU through OpenGL ES when the default Vulkan adapter is unavailable.
	for ( const options of [
		{ powerPreference: 'high-performance' }, {}, { powerPreference: 'low-power' },
		{ featureLevel: 'compatibility', powerPreference: 'high-performance' },
		{ featureLevel: 'compatibility' },
	] ) {

		try {
			const adapter = await navigator.gpu.requestAdapter( options );
			if ( adapter ) return adapter;
		} catch {
			// Keep trying without a preference for Android WebViews that reject adapter options.
		}

	}
	return null;

}

function startPhoneMode( reason ) {

	console.info( '[Fishing Free] Starting phone fishing mode:', reason );
	const loader = document.getElementById( 'loader' );
	loader?.classList.add( 'tw-hidden' );
	const fps = document.getElementById( 'fps' );
	if ( fps ) fps.style.display = 'none';
	return import( './mobile/CanvasFishingGame.js' ).then( ( { CanvasFishingGame } ) => {

		const game = new CanvasFishingGame( document.getElementById( 'app' ), { reason } );
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
