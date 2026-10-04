import './core/BenchSeed.js';
import { Capacitor } from '@capacitor/core';
import { CanvasFishingGame } from './mobile/CanvasFishingGame.js';

// ?bench runs in background tabs too (automation): rAF does not fire in a hidden page.
if ( /[?&]bench\b/.test( location.search ) ) {

	const raf = window.requestAnimationFrame.bind( window ), caf = window.cancelAnimationFrame.bind( window );
	window.requestAnimationFrame = ( cb ) => document.visibilityState === 'hidden' ? setTimeout( () => cb( performance.now() ), 16 ) : raf( cb );
	window.cancelAnimationFrame = ( id ) => ( clearTimeout( id ), caf( id ) );

}

const bench = /[?&]bench\b/.test( location.search );
const desktopShell = new URLSearchParams( location.search ).get( 'desktop' ) === '1';
const WEBGPU_PROBE_TIMEOUT_MS = 10000;
const ANDROID_WEBGPU_PROBE_TIMEOUT_MS = 4500;

const versionLabel = document.querySelector( '[data-app-version]' );
if ( versionLabel ) versionLabel.textContent = 'VERSION ' + __FISHING_FREE_VERSION__;

if ( ! bench && ! desktopShell && 'serviceWorker' in navigator ) {
	if ( Capacitor.isNativePlatform() ) {
		// Native releases already bundle every asset. Remove an older PWA worker/cache so an APK update
		// cannot keep serving stale JavaScript from WebView storage; local saves are in localStorage.
		navigator.serviceWorker.getRegistrations()
			.then( ( registrations ) => Promise.all( registrations
				.filter( ( registration ) => new URL( registration.scope ).origin === location.origin )
				.map( ( registration ) => registration.unregister() ) ) )
			.then( () => 'caches' in window ? window.caches.keys() : [] )
			.then( ( names ) => Promise.all( names.filter( ( name ) => name.startsWith( 'fishing-free-shell-' ) ).map( ( name ) => window.caches.delete( name ) ) ) )
			.catch( ( error ) => console.warn( '[Fishing Free] Native cache cleanup could not be completed.', error ) );
	} else if ( ! import.meta.env.DEV ) {
		navigator.serviceWorker.register( `${ import.meta.env.BASE_URL }sw.js`, { scope: import.meta.env.BASE_URL } )
			.catch( ( error ) => console.warn( '[Fishing Free] Offline cache could not be enabled.', error ) );
	}
}

function browserGraphicsDetails( reason = '' ) {

	const ua = navigator.userAgent || '';
	const android = ua.match( /Android\s+([\d.]+)/i );
	const chromium = ua.match( /(?:Chrome|Chromium|CriOS)\/([\d.]+)/i );
	const webkit = ua.match( /Version\/([\d.]+)/i );
	const probe = globalThis.__fishingFreeWebGPUProbe || {};
	return {
		appVersion: __FISHING_FREE_VERSION__,
		mode: /;\s*wv\)/i.test( ua ) ? 'Android WebView' : /Android/i.test( ua ) ? 'Android browser' : /iPhone|iPad|iPod/i.test( ua ) ? 'iOS browser' : 'Browser',
		osVersion: android ? `Android ${ android[ 1 ] }` : /iPhone|iPad|iPod/i.test( ua ) ? 'iOS (version not exposed)' : 'Not reported',
		engineVersion: chromium ? `Chromium ${ chromium[ 1 ] }` : webkit ? `WebKit ${ webkit[ 1 ] }` : 'Not reported',
		secureContext: globalThis.isSecureContext ? 'Yes' : 'No',
		webgpuApi: navigator.gpu ? 'Available' : 'Not exposed',
		adapterProbe: probe.result || ( navigator.gpu ? 'Not run' : 'Not available' ),
		adapterAttempts: Array.isArray( probe.attempts ) && probe.attempts.length ? probe.attempts.join( '; ' ) : 'No adapter attempts recorded',
		reason: reason || probe.startupError || 'No startup reason recorded',
	};

}

function showGraphicsError( reason ) {

	const loader = document.getElementById( 'loader' );
	if ( ! loader ) return;
	const details = browserGraphicsDetails( reason );
	const status = loader.querySelector( '.loader-status' );
	const note = loader.querySelector( '.loader-note' );
	const androidVersion = Number( details.osVersion.match( /Android\s+(\d+)/i )?.[ 1 ] || 0 );
	const androidBelowSupportFloor = androidVersion > 0 && androidVersion < 12;

	if ( status ) status.textContent = androidBelowSupportFloor
		? details.osVersion + ' has limited WebGPU support and no compatible adapter was available. Scenic Fishing is opening.'
		: 'Full 3D could not start because the browser did not provide a compatible graphics adapter.';
	if ( note ) {
		if ( details.mode === 'Android WebView' ) note.textContent = 'This game runs in Android System WebView, separate from Chrome. Update Android System WebView, then restart; DEVICE DETAILS reports what the game app can access.';
		else if ( details.mode === 'Android browser' ) note.textContent = 'A GPU status page can show WebGPU enabled while this game runtime has no usable adapter. Update Chrome and send DEVICE DETAILS if it persists.';
		else if ( details.mode === 'iOS browser' ) note.textContent = 'This Safari runtime could not provide a usable WebGPU adapter. Update iOS and try again.';
		else note.textContent = 'Update this browser and its graphics drivers, then tap TRY AGAIN. DEVICE DETAILS reports what this game runtime can access.';
	}

	const percent = loader.querySelector( '.loader-pct' );
	const elapsed = loader.querySelector( '.loader-time' );
	const fill = loader.querySelector( '.loader-fill' );
	if ( percent ) percent.textContent = '—';
	if ( elapsed ) elapsed.textContent = '';
	if ( fill ) fill.style.transform = 'scaleX(0.02)';
	loader.classList.remove( 'tw-hidden' );
	loader.classList.add( 'tw-error', 'is-compiling' );

	loader.querySelector( '[data-graphics-actions]' )?.remove();
	const panel = loader.querySelector( '.loader-panel' );
	if ( ! panel ) return;
	const actions = document.createElement( 'div' );
	actions.className = 'loader-actions';
	actions.dataset.graphicsActions = '';
	const retry = document.createElement( 'button' );
	retry.className = 'loader-action loader-action-primary';
	retry.type = 'button';
	retry.textContent = 'TRY AGAIN';
	retry.addEventListener( 'click', () => window.location.reload() );
	const scenicButton = document.createElement( 'button' );
	scenicButton.className = 'loader-action loader-action-primary';
	scenicButton.type = 'button';
	scenicButton.textContent = 'PLAY SCENIC FISHING';
	const openScenicFishing = () => {

		scenicButton.disabled = true;
		scenicButton.textContent = 'OPENING SCENIC MODE…';
		try {

			const appRoot = document.getElementById( 'app' );
			if ( ! appRoot ) throw new Error( 'The game container is missing.' );
			window.__mobileFishingGame = new CanvasFishingGame( appRoot, { reason, graphicsDetails: details } ).start();
			document.getElementById( 'fps' )?.remove();
			loader.remove();
			return true;

		} catch ( error ) {

			console.error( '[Fishing Free] Scenic fishing mode could not start.', error );
			details.fallbackError = error?.message || String( error );
			if ( status ) status.textContent = 'Scenic Fishing could not start on this build.';
			if ( note ) note.textContent = 'Tap RETRY SCENIC FISHING. If it still fails, open DEVICE DETAILS and send that report.';
			scenicButton.disabled = false;
			scenicButton.textContent = 'RETRY SCENIC FISHING';
			return false;

		}

	};
	scenicButton.addEventListener( 'click', openScenicFishing );
	const reportButton = document.createElement( 'button' );
	reportButton.className = 'loader-action';
	reportButton.type = 'button';
	reportButton.textContent = 'DEVICE DETAILS';
	const report = document.createElement( 'pre' );
	report.className = 'loader-graphics-report';
	report.hidden = true;
	report.textContent = Object.entries( details ).map( ( [ key, value ] ) => key + ': ' + value ).join( '\n' );
	reportButton.addEventListener( 'click', () => {
		report.hidden = ! report.hidden;
		reportButton.textContent = report.hidden ? 'DEVICE DETAILS' : 'HIDE DETAILS';
	} );
	const copy = document.createElement( 'button' );
	copy.className = 'loader-action';
	copy.type = 'button';
	copy.textContent = 'COPY REPORT';
	copy.addEventListener( 'click', async () => {
		try {
			await navigator.clipboard.writeText( report.textContent );
			copy.textContent = 'COPIED';
		} catch {
			copy.textContent = 'COPY UNAVAILABLE';
		}
	} );
	actions.append( retry, scenicButton, reportButton, copy );
	panel.append( actions, report );

	// Mobile browsers and native apps can lack a usable WebGPU adapter. Keep full
	// 3D as the first choice, then open the playable fallback instead of stranding
	// phone players on the diagnostics screen. Desktop keeps a manual choice.
	const nativePlatform = Capacitor.getPlatform();
	const isNativeMobileApp = Capacitor.isNativePlatform() && [ 'android', 'ios' ].includes( nativePlatform );
	const userAgent = navigator.userAgent || '';
	const isMobileBrowser = /Android|iPhone|iPad|iPod/i.test( userAgent ) ||
		( navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1 ) ||
		( navigator.maxTouchPoints > 0 && globalThis.matchMedia?.( '(pointer: coarse)' ).matches && Math.min( screen.width, screen.height ) < 900 );
	if ( isNativeMobileApp || isMobileBrowser ) {
		const mobileClient = isNativeMobileApp ? nativePlatform + ' app' : 'mobile browser';
		if ( status ) status.textContent = '3D graphics are unavailable here. Opening Scenic Fishing…';
		if ( note ) note.textContent = 'The game could not start its 3D renderer in this ' + mobileClient + ', so it is opening the playable scenic mode.';
		openScenicFishing();
	}

}
const loaderArt = document.querySelector( '.loader-art' );
if ( loaderArt ) {
	const showArt = () => loaderArt.classList.add( 'is-in' );
	if ( loaderArt.complete && loaderArt.naturalWidth > 0 ) showArt();
	else loaderArt.addEventListener( 'load', showArt, { once: true } );
}

async function findWebGPUAdapter() {

	if ( ! navigator.gpu ) return null;
	const probe = globalThis.__fishingFreeWebGPUProbe = { attempts: [], result: 'Searching for a graphics adapter.' };
	const androidVersion = Number( navigator.userAgent.match( /Android\s+(\d+)/i )?.[ 1 ] || 0 );
	const probeTimeoutMs = androidVersion >= 12 ? ANDROID_WEBGPU_PROBE_TIMEOUT_MS : WEBGPU_PROBE_TIMEOUT_MS;
	const deadline = performance.now() + probeTimeoutMs;
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
			probe.result = `The adapter search reached its ${ ( probeTimeoutMs / 1000 ).toFixed( 1 ) }-second time limit.`;
			return null;
		}
		const isOlderAndroidCompatibilityAttempt = androidVersion > 0 && androidVersion < 12 && label.startsWith( 'Compatibility' );
		// The OpenGL ES compatibility adapter can take longer to initialize on Android 10/11.
		// Android 12+ WebViews still get several backend attempts, but one stalled request should
		// not keep phone players on the startup screen for the desktop timeout.
		const attemptTimeoutMs = isOlderAndroidCompatibilityAttempt ? 4500 : androidVersion >= 12 ? 1500 : 2500;
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
				width: Number( app.qs.get( 'width' ) ) || 2560, height: Number( app.qs.get( 'height' ) ) || 1267,
			} );

		} else app.start();
		ui.showStartOverlay( () => {

			if ( ! app.isTouchDevice ) app.input.requestLock();
			if ( app.audio ) app.audio.resume();

		} );

	} catch ( error ) {

		console.error( '[Fishing Free] Full 3D renderer could not start; showing graphics diagnostics.', error );
		globalThis.__fishingFreeWebGPUProbe ||= { attempts: [], result: 'An adapter was found, but renderer startup failed.' };
		globalThis.__fishingFreeWebGPUProbe.startupError = error.message;
		if ( bench ) {

			ui.setLoadingError( 'WebGPU game could not start: ' + error.message );
			return;

		}
		showGraphicsError( error.message || 'WebGPU is unavailable on this device.' );

	}

}

async function start() {

	if ( bench ) return startWebGPUGame();
	// Try Chromium's compatibility adapter where an experimental WebGPU backend is available.
	// Probe the actual adapter instead of forcing those phones into Scenic Fishing by OS version.
	if ( ! navigator.gpu ) return showGraphicsError( 'This browser does not expose WebGPU.' );
	const adapter = await findWebGPUAdapter();
	if ( ! adapter ) return showGraphicsError( 'WebGPU is present but could not create a graphics adapter.' );
	// Hand the preflight adapter to the renderer so it is not requested twice.
	globalThis.__fishingFreeWebGPUAdapter = adapter;
	return startWebGPUGame();

}

start().catch( ( error ) => {

	console.error( '[Fishing Free] Startup failed.', error );
	if ( bench ) return;
	showGraphicsError( error.message || 'The 3D renderer could not start.' );


} );
