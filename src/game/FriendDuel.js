import { FISH } from './FishTable.js';

const CHALLENGE_PARAM = 'twc';
const RESULT_PARAM = 'twr';
const ONLINE_PARAM = 'twd';
const roundKg = ( value ) => Math.round( value * 100 ) / 100;
const knownSpecies = ( id ) => typeof id === 'string' && Object.prototype.hasOwnProperty.call( FISH, id );

function duelApiURL() {
	return ( import.meta.env.VITE_DUEL_API_URL || '' ).trim().replace( /\/$/, '' );
}

export function hasOnlineDuelService() {
	return !! duelApiURL();
}

async function apiRequest( path, options = {} ) {
	const root = duelApiURL();
	if ( ! root ) throw new Error( 'Online duels are not configured.' );
	const response = await fetch( `${ root }${ path }`, {
		...options,
		headers: { 'Content-Type': 'application/json', ...options.headers },
		signal: AbortSignal.timeout( 8000 ),
	} );
	let data;
	try { data = await response.json(); } catch { throw new Error( 'The duel server returned an invalid response.' ); }
	if ( ! response.ok ) throw new Error( data?.error || `Duel request failed (${ response.status }).` );
	return data;
}

export function createOnlineFriendDuel( info ) {
	return apiRequest( '/api/duels', { method: 'POST', body: JSON.stringify( { species: info.species, kg: info.kg } ) } );
}

export function submitOnlineFriendDuel( id, info ) {
	return apiRequest( `/api/duels/${ encodeURIComponent( id ) }/result`, { method: 'POST', body: JSON.stringify( { species: info.species, kg: info.kg } ) } );
}

export function getOnlineFriendDuel( id ) {
	return apiRequest( `/api/duels/${ encodeURIComponent( id ) }` );
}

function makeId() {
	return globalThis.crypto?.randomUUID?.() || `${ Date.now().toString( 36 ) }${ Math.random().toString( 36 ).slice( 2, 10 ) }`;
}

function encode( value ) {
	return btoa( JSON.stringify( value ) ).replace( /\+/g, '-' ).replace( /\//g, '_' ).replace( /=+$/g, '' );
}

function decode( value ) {
	if ( typeof value !== 'string' || value.length > 320 ) return null;
	try {
		const base64 = value.replace( /-/g, '+' ).replace( /_/g, '/' );
		return JSON.parse( atob( base64.padEnd( Math.ceil( base64.length / 4 ) * 4, '=' ) ) );
	} catch { return null; }
}

export function createFriendChallenge( info ) {
	if ( ! info || ! knownSpecies( info.species ) || ! Number.isFinite( info.kg ) || info.kg <= 0 ) return null;
	return { v: 1, id: makeId(), species: info.species, kg: roundKg( info.kg ), cm: Math.round( info.cm || 0 ) };
}

export function readFriendChallenge( search = '' ) {
	const params = new URLSearchParams( search );
	const challenge = decode( params.get( CHALLENGE_PARAM ) );
	const serverId = params.get( ONLINE_PARAM );
	if ( ! challenge || challenge.v !== 1 || typeof challenge.id !== 'string' || challenge.id.length > 64 || ! knownSpecies( challenge.species ) || ! Number.isFinite( challenge.kg ) || challenge.kg <= 0 || challenge.kg > 1000 ) return null;
	const result = decode( params.get( RESULT_PARAM ) );
	const validResult = result && Number.isFinite( result.kg ) && result.kg > 0 && result.kg <= 1000
		? { kg: roundKg( result.kg ), cm: Math.max( 0, Math.round( result.cm || 0 ) ) }
		: null;
	return { ...challenge, kg: roundKg( challenge.kg ), cm: Math.max( 0, Math.round( challenge.cm || 0 ) ), result: validResult, serverId: serverId && /^[A-Za-z0-9_-]{20,32}$/.test( serverId ) ? serverId : null };
}

export function friendChallengeUrl( baseUrl, info, activeChallenge = null ) {
	if ( ! baseUrl ) return '';
	try {
		const url = new URL( baseUrl );
		let challenge = activeChallenge;
		if ( ! challenge ) challenge = createFriendChallenge( info );
		if ( ! challenge ) return '';
		url.searchParams.set( CHALLENGE_PARAM, encode( { v: 1, id: challenge.id, species: challenge.species, kg: challenge.kg, cm: challenge.cm } ) );
		if ( challenge.serverId && /^[A-Za-z0-9_-]{20,32}$/.test( challenge.serverId ) ) url.searchParams.set( ONLINE_PARAM, challenge.serverId );
		else url.searchParams.delete( ONLINE_PARAM );
		if ( info?.species === challenge.species && Number.isFinite( info.kg ) && info.kg > 0 ) {
			url.searchParams.set( RESULT_PARAM, encode( { kg: roundKg( info.kg ), cm: Math.round( info.cm || 0 ) } ) );
		} else {
			url.searchParams.delete( RESULT_PARAM );
		}
		return url.href;
	} catch { return ''; }
}
