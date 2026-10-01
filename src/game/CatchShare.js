import { Capacitor } from '@capacitor/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { createFriendChallenge, createOnlineFriendDuel, friendChallengeUrl, hasOnlineDuelService, submitOnlineFriendDuel } from './FriendDuel.js';

const WIDTH = 1200;
const HEIGHT = 630;

function roundedRect( ctx, x, y, w, h, r ) {

	const radius = Math.min( r, w / 2, h / 2 );
	ctx.beginPath();
	ctx.moveTo( x + radius, y );
	ctx.arcTo( x + w, y, x + w, y + h, radius );
	ctx.arcTo( x + w, y + h, x, y + h, radius );
	ctx.arcTo( x, y + h, x, y, radius );
	ctx.arcTo( x, y, x + w, y, radius );
	ctx.closePath();

}

function fitText( ctx, text, maxWidth, startSize, weight = 700 ) {

	let size = startSize;
	while ( size > 24 ) {
		ctx.font = `${ weight } ${ size }px system-ui, sans-serif`;
		if ( ctx.measureText( text ).width <= maxWidth ) break;
		size -= 2;
	}
	return size;

}

function drawWaves( ctx ) {

	const water = ctx.createLinearGradient( 0, 320, 0, HEIGHT );
	water.addColorStop( 0, 'rgba(21, 94, 103, 0.22)' );
	water.addColorStop( 1, 'rgba(4, 26, 39, 0.94)' );
	ctx.fillStyle = water;
	ctx.fillRect( 0, 300, WIDTH, HEIGHT - 300 );

	for ( let row = 0; row < 7; row ++ ) {
		ctx.beginPath();
		const y = 366 + row * 45;
		ctx.moveTo( 0, y );
		for ( let x = 0; x <= WIDTH; x += 32 ) {
			ctx.lineTo( x, y + Math.sin( x * 0.009 + row * 0.8 ) * ( 5 + row ) );
		}
		ctx.strokeStyle = `rgba(114, 207, 194, ${ 0.12 - row * 0.011 })`;
		ctx.lineWidth = row < 2 ? 2 : 1;
		ctx.stroke();
	}

}

function drawFallbackFish( ctx ) {

	ctx.save();
	ctx.translate( 862, 302 );
	ctx.fillStyle = 'rgba(111, 214, 198, 0.26)';
	ctx.beginPath();
	ctx.ellipse( 0, 0, 205, 87, - 0.04, 0, Math.PI * 2 );
	ctx.fill();
	ctx.beginPath();
	ctx.moveTo( - 195, 0 );
	ctx.lineTo( - 295, - 62 );
	ctx.lineTo( - 280, 0 );
	ctx.lineTo( - 295, 62 );
	ctx.closePath();
	ctx.fill();
	ctx.beginPath();
	ctx.moveTo( - 35, - 68 );
	ctx.lineTo( 28, - 148 );
	ctx.lineTo( 72, - 61 );
	ctx.closePath();
	ctx.fill();
	ctx.fillStyle = 'rgba(255, 241, 220, 0.78)';
	ctx.beginPath();
	ctx.arc( 130, - 15, 8, 0, Math.PI * 2 );
	ctx.fill();
	ctx.restore();

}

function makeCatchImage( info, fish, portrait, publicUrl ) {

	const canvas = document.createElement( 'canvas' );
	canvas.width = WIDTH;
	canvas.height = HEIGHT;
	const ctx = canvas.getContext( '2d' );
	if ( ! ctx ) throw new Error( 'Canvas is unavailable' );

	const sky = ctx.createLinearGradient( 0, 0, WIDTH, HEIGHT );
	sky.addColorStop( 0, '#102b3b' );
	sky.addColorStop( 0.55, '#174555' );
	sky.addColorStop( 1, '#071b2a' );
	ctx.fillStyle = sky;
	ctx.fillRect( 0, 0, WIDTH, HEIGHT );
	drawWaves( ctx );

	const glow = ctx.createRadialGradient( 900, 250, 15, 900, 250, 390 );
	glow.addColorStop( 0, 'rgba(236, 186, 103, 0.21)' );
	glow.addColorStop( 1, 'rgba(236, 186, 103, 0)' );
	ctx.fillStyle = glow;
	ctx.fillRect( 460, 0, 740, 570 );

	ctx.fillStyle = 'rgba(244, 234, 214, 0.62)';
	ctx.font = '700 21px system-ui, sans-serif';
	ctx.letterSpacing = '5px';
	ctx.fillText( 'FISHING FREE  /  CARIBBEAN FISHING', 68, 76 );

	const badge = info.record ? 'NEW PERSONAL RECORD' : info.newSpecies ? 'NEW SPECIES' : 'FRESH CATCH';
	roundedRect( ctx, 68, 116, info.record ? 302 : info.newSpecies ? 202 : 172, 42, 21 );
	ctx.fillStyle = info.record ? '#e3b65e' : info.newSpecies ? '#6fd6c6' : 'rgba(244,234,214,0.16)';
	ctx.fill();
	ctx.fillStyle = '#102734';
	ctx.font = '800 15px system-ui, sans-serif';
	ctx.letterSpacing = '2px';
	ctx.fillText( badge, 86, 144 );

	const nameSize = fitText( ctx, fish.name, 490, 60 );
	ctx.fillStyle = '#fbf1dc';
	ctx.font = `700 ${ nameSize }px system-ui, sans-serif`;
	ctx.letterSpacing = '0px';
	ctx.fillText( fish.name, 68, 226 );
	ctx.fillStyle = 'rgba(244,234,214,0.68)';
	ctx.font = 'italic 21px Georgia, serif';
	ctx.fillText( fish.sci || 'Tropical catch', 70, 264 );

	const values = [
		[ 'LENGTH', `${ info.cm } cm` ],
		[ 'WEIGHT', `${ info.kg < 1 ? info.kg.toFixed( 2 ) : info.kg.toFixed( 1 ) } kg` ],
	];
	values.forEach( ( [ label, value ], i ) => {
		const x = 68 + i * 222;
		roundedRect( ctx, x, 318, 202, 94, 9 );
		ctx.fillStyle = 'rgba(232, 220, 192, 0.1)';
		ctx.fill();
		ctx.strokeStyle = 'rgba(214, 180, 110, 0.48)';
		ctx.lineWidth = 1;
		ctx.stroke();
		ctx.fillStyle = 'rgba(222, 190, 125, 0.9)';
		ctx.font = '700 13px system-ui, sans-serif';
		ctx.letterSpacing = '2px';
		ctx.fillText( label, x + 18, 348 );
		ctx.fillStyle = '#fbf1dc';
		ctx.font = '600 29px ui-monospace, monospace';
		ctx.letterSpacing = '0px';
		ctx.fillText( value, x + 18, 390 );
	} );

	ctx.save();
	roundedRect( ctx, 535, 105, 612, 372, 18 );
	ctx.clip();
	ctx.fillStyle = 'rgba(3, 17, 26, 0.22)';
	ctx.fillRect( 535, 105, 612, 372 );
	if ( portrait && portrait.width && portrait.height ) {
		try { ctx.drawImage( portrait, 548, 119, 586, 344 ); } catch { drawFallbackFish( ctx ); }
	} else {
		drawFallbackFish( ctx );
	}
	ctx.restore();

	ctx.fillStyle = 'rgba(244,234,214,0.86)';
	ctx.font = '700 18px system-ui, sans-serif';
	ctx.letterSpacing = '1px';
	ctx.fillText( 'CAN YOU BEAT THIS CATCH?', 68, 526 );
	ctx.fillStyle = 'rgba(244,234,214,0.54)';
	ctx.font = '500 15px system-ui, sans-serif';
	ctx.letterSpacing = '0px';
	let urlLabel = '';
	try {
		if ( publicUrl ) {
			const address = new URL( publicUrl );
			urlLabel = `${ address.host }${ address.pathname.replace( /\/$/, '' ) }`;
		}
	} catch { /* Ignore a malformed optional public URL. */ }
	ctx.fillText( urlLabel || 'Share your best catch from Fishing Free', 68, 557 );
	ctx.strokeStyle = 'rgba(244,234,214,0.18)';
	ctx.beginPath();
	ctx.moveTo( 68, 587 );
	ctx.lineTo( 1132, 587 );
	ctx.stroke();
	ctx.fillStyle = 'rgba(244,234,214,0.4)';
	ctx.font = '600 12px system-ui, sans-serif';
	ctx.letterSpacing = '3px';
	ctx.fillText( 'CAST  ·  EXPLORE  ·  DISCOVER', 68, 610 );

	return canvas;

}

function canvasToBlob( canvas ) {
	return new Promise( ( resolve, reject ) => {
		canvas.toBlob( ( blob ) => blob ? resolve( blob ) : reject( new Error( 'Could not create catch image' ) ), 'image/png' );
	} );
}

async function toBase64( blob ) {
	const bytes = new Uint8Array( await blob.arrayBuffer() );
	let binary = '';
	for ( let i = 0; i < bytes.length; i += 0x8000 ) {
		binary += String.fromCharCode( ...bytes.subarray( i, i + 0x8000 ) );
	}
	return btoa( binary );
}

function gameUrl() {
	const configured = import.meta.env.VITE_PUBLIC_GAME_URL;
	if ( configured ) return configured;
	if ( Capacitor.isNativePlatform() ) return '';
	if ( ! /^https?:$/.test( window.location.protocol ) ) return '';
	if ( [ 'localhost', '127.0.0.1', '::1' ].includes( window.location.hostname ) ) return '';
	return new URL( window.location.pathname, window.location.origin ).href;
}

function shareMessage( info, fish, challenge = null ) {
	const weight = `${ info.kg < 1 ? info.kg.toFixed( 2 ) : info.kg.toFixed( 1 ) } kg`;
	if ( challenge && info.species === challenge.species ) {
		if ( info.kg > challenge.kg ) return `I beat your Fishing Free challenge! ${ fish.name }, ${ weight }. Your target was ${ challenge.kg.toFixed( 2 ) } kg. Open the link to compare catches.`;
		return `My Fishing Free challenge catch: ${ fish.name }, ${ weight }. The target to beat is ${ challenge.kg.toFixed( 2 ) } kg. Can you do better?`;
	}
	const moment = info.record ? 'I just set a new personal record' : info.newSpecies ? 'I discovered a new species' : 'I landed a catch';
	return `${ moment }: ${ fish.name }, ${ weight } and ${ info.cm } cm in Fishing Free. Can you beat it?`;
}

export async function shareCatch( info, fish, portrait, activeChallenge = null ) {

	const baseUrl = gameUrl();
	let challenge = activeChallenge || createFriendChallenge( info );
	let serverUnavailable = false;
	if ( ! activeChallenge && hasOnlineDuelService() ) {
		try {
			const duel = await createOnlineFriendDuel( info );
			challenge = { ...challenge, serverId: duel.id };
		} catch ( error ) {
			serverUnavailable = true;
			console.warn( 'could not create online friend duel; using a share-only challenge link', error );
		}
	}
	if ( activeChallenge?.serverId && info.species === activeChallenge.species ) {
		try { await submitOnlineFriendDuel( activeChallenge.serverId, info ); }
		catch ( error ) {
			serverUnavailable = true;
			console.warn( 'could not submit the online duel result; sharing the catch link instead', error );
		}
	}
	const url = friendChallengeUrl( baseUrl, info, challenge );
	const image = makeCatchImage( info, fish, portrait, baseUrl );
	const blob = await canvasToBlob( image );
	const filename = `fishing-free-catch-${ Date.now() }.png`;
	const title = `Fishing Free catch: ${ fish.name }`;
	// Native builds have no public destination until the owner configures one.
	// Do not tell a friend to open a challenge link when the share payload cannot contain it.
	const text = shareMessage( info, fish, url ? activeChallenge : null );

	if ( Capacitor.isNativePlatform() ) {
		let fileUrl = '';
		try {
			const result = await Filesystem.writeFile( { path: filename, data: await toBase64( blob ), directory: Directory.Cache } );
			fileUrl = result.uri;
		} catch {
			// If the image cannot be staged in the cache, share the catch details instead.
		}
		if ( fileUrl ) await Share.share( { title, text, ...( url ? { url } : {} ), files: [ fileUrl ], dialogTitle: 'Share your catch' } );
		else await Share.share( { title, text, ...( url ? { url } : {} ), dialogTitle: 'Share your catch' } );
		return serverUnavailable ? 'shared-offline' : 'shared';
	}

	if ( typeof navigator.share === 'function' ) {
		const file = new File( [ blob ], filename, { type: 'image/png' } );
		if ( navigator.canShare?.( { files: [ file ] } ) ) {
			await navigator.share( { title, text, ...( url ? { url } : {} ), files: [ file ] } );
			return serverUnavailable ? 'shared-offline' : 'shared';
		}
		await navigator.share( { title, text: [ text, url ].filter( Boolean ).join( '\n' ) } );
		return serverUnavailable ? 'shared-offline' : 'shared';
	}

	if ( navigator.clipboard?.writeText ) {
		await navigator.clipboard.writeText( [ text, url ].filter( Boolean ).join( '\n' ) );
		return serverUnavailable ? 'copied-offline' : 'copied';
	}

	throw new Error( 'Sharing is not available on this device' );

}
