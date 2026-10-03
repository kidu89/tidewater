const { app, BrowserWindow } = require( 'electron' );

const url = process.argv[ 2 ];
if ( ! url || ! url.startsWith( 'http://127.0.0.1:5189/' ) ) {
	console.error( '[Steam capture] Refusing to open an unexpected game URL.' );
	app.quit();
} else {
	app.whenReady().then( async () => {
		const window = new BrowserWindow( {
			width: 1920,
			height: 1080,
			show: true,
			backgroundColor: '#02070c',
			autoHideMenuBar: true,
			webPreferences: {
				backgroundThrottling: false,
				contextIsolation: true,
				nodeIntegration: false,
				sandbox: true,
				webSecurity: true,
			},
		} );
		window.webContents.on( 'console-message', ( event, detailsOrLevel, legacyMessage ) => {
			const level = typeof detailsOrLevel === 'object' ? detailsOrLevel.level : detailsOrLevel;
			const message = typeof detailsOrLevel === 'object' ? detailsOrLevel.message : legacyMessage;
			if ( level >= 2 ) console.error( `[Game renderer] ${ message }` );
		} );
		window.webContents.on( 'did-fail-load', ( event, code, message, failedUrl ) => {
			if ( code !== - 3 ) console.error( `[Steam capture] Page failed to load (${ code }): ${ message } · ${ failedUrl }` );
		} );
		await window.loadURL( url );
	} ).catch( ( error ) => {
		console.error( '[Steam capture] Could not open the game window.', error );
		app.exit( 1 );
	} );
}
