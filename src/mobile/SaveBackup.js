import { FISH } from '../game/FishTable.js';
import { WEEKLY_BRIEFS } from '../game/WeeklyBriefs.js';
import { GameState } from '../game/GameState.js';
import { Capacitor } from '@capacitor/core';

export const SCENIC_SAVE_KEY = 'tidewater.phone-mode.v1';
const MAIN_SAVE_KEYS = [ 'tidewater.save.v2', 'tidewater.save.v1' ];
const BACKUP_FORMAT = 'fishing-free-save-backup';
const BACKUP_SCHEMA = 1;
export const MAX_SAVE_BACKUP_BYTES = 1024 * 1024;
const SCENIC_HABITATS = [ 'pier', 'cay', 'reef', 'deep', 'mangrove', 'atoll' ];
const SCENIC_LOCATIONS = [ 'pelican-cay', 'mangrove-reach', 'sunspire-atoll' ];

const isRecord = ( value ) => value !== null && typeof value === 'object' && ! Array.isArray( value );
const numberOr = ( value, fallback = 0 ) => Number.isFinite( Number( value ) ) ? Number( value ) : fallback;
const nonnegative = ( value ) => Math.max( 0, numberOr( value ) );
const hasOwn = ( object, key ) => Object.prototype.hasOwnProperty.call( object, key );

function safeStorage() {
	try { return window.localStorage; } catch { return null; }
}

export function normalizeScenicSave( value ) {

	if ( ! isRecord( value ) ) return null;
	const bag = Array.isArray( value.bag )
		? value.bag.filter( ( fish ) => isRecord( fish ) && FISH[ fish.species ] && Number.isFinite( fish.kg ) && fish.kg > 0 && Number.isFinite( fish.value ) && fish.value >= 0 ).slice( 0, 10 )
		: [];
	const collection = {};
	if ( isRecord( value.collection ) ) {

		for ( const id of Object.keys( value.collection ) ) {

			if ( ! FISH[ id ] ) continue;
			const entry = value.collection[ id ];
			if ( isRecord( entry ) && Number.isFinite( entry.count ) ) collection[ id ] = { count: Math.floor( nonnegative( entry.count ) ), bestKg: nonnegative( entry.bestKg ) };

		}

	}

	const savedBrief = isRecord( value.weeklyBrief ) && /^\d{4}-W\d{2}$/.test( value.weeklyBrief.weekId || '' )
		? WEEKLY_BRIEFS.find( ( brief ) => brief.id === value.weeklyBrief.id && SCENIC_HABITATS.includes( brief.habitat ) && ( ! brief.location || SCENIC_LOCATIONS.includes( brief.location ) ) )
		: null;
	const weeklyBrief = savedBrief ? {
		weekId: value.weeklyBrief.weekId,
		id: savedBrief.id,
		progress: Math.min( savedBrief.target, Math.floor( nonnegative( value.weeklyBrief.progress ) ) ),
		claimed: !! value.weeklyBrief.claimed,
	} : null;
	return {
		cash: nonnegative( value.cash ),
		rodLevel: Math.max( 0, Math.min( 3, Math.floor( numberOr( value.rodLevel ) ) ) ),
		bag,
		collection,
		catches: Math.floor( nonnegative( value.catches ) ),
		bestKg: nonnegative( value.bestKg ),
		weeklyBrief,
	};

}

function normalizeMainSave( value ) {

	if ( ! isRecord( value ) || ( value.v !== 1 && value.v !== 2 ) ) return null;
	try {

		const state = new GameState( null );
		return state.fromJSON( value ) ? state.toJSON() : null;

	} catch { return null; }

}

export function createSaveBackup( scenicData, storage = safeStorage(), appVersion = 'unknown', exportedAt = new Date().toISOString() ) {

	const saves = { scenic: normalizeScenicSave( scenicData ) };
	if ( storage ) {

		const webgpu = {};
		for ( const key of MAIN_SAVE_KEYS ) {

			let raw;
			try { raw = storage.getItem( key ); } catch { break; }
			if ( ! raw ) continue;
			try {

				const parsed = normalizeMainSave( JSON.parse( raw ) );
				if ( parsed ) webgpu[ key ] = parsed;

			} catch { /* Ignore a damaged 3D save; preserve the playable Scenic progress. */ }

		}
		if ( Object.keys( webgpu ).length ) saves.webgpu = webgpu;

	}
	return JSON.stringify( { format: BACKUP_FORMAT, schema: BACKUP_SCHEMA, appVersion, exportedAt, saves } );

}

export function parseSaveBackup( text ) {

	if ( typeof text !== 'string' || text.length > MAX_SAVE_BACKUP_BYTES ) throw new Error( 'The backup file is too large or unreadable.' );
	let backup;
	try { backup = JSON.parse( text ); } catch { throw new Error( 'This is not a valid Fishing Free backup file.' ); }
	if ( ! isRecord( backup ) || backup.format !== BACKUP_FORMAT || backup.schema !== BACKUP_SCHEMA || ! isRecord( backup.saves ) ) throw new Error( 'This backup was made by an unsupported game version.' );
	const saves = {};
	if ( hasOwn( backup.saves, 'scenic' ) ) {

		const scenic = backup.saves.scenic;
		if ( ! isRecord( scenic ) || ! Array.isArray( scenic.bag ) || ! isRecord( scenic.collection ) || ! Number.isFinite( scenic.cash ) || ! Number.isFinite( scenic.catches ) ) throw new Error( 'The Scenic Fishing save in this file is damaged.' );
		saves.scenic = normalizeScenicSave( scenic );
		if ( ! saves.scenic ) throw new Error( 'The Scenic Fishing save in this file is unsupported.' );

	}
	if ( hasOwn( backup.saves, 'webgpu' ) ) {

		const webgpu = backup.saves.webgpu;
		if ( ! isRecord( webgpu ) ) throw new Error( 'The 3D fishing save in this file is damaged.' );
		const normalized = {};
		for ( const key of MAIN_SAVE_KEYS ) if ( hasOwn( webgpu, key ) ) {

			const save = normalizeMainSave( webgpu[ key ] );
			if ( ! save ) throw new Error( 'The 3D fishing save in this file is unsupported.' );
			normalized[ key ] = save;

		}
		if ( ! Object.keys( normalized ).length ) throw new Error( 'The 3D fishing save in this file is empty.' );
		saves.webgpu = normalized;

	}
	if ( ! Object.keys( saves ).length ) throw new Error( 'This backup does not contain any game progress.' );
	return { appVersion: String( backup.appVersion || 'unknown' ).slice( 0, 32 ), exportedAt: String( backup.exportedAt || '' ).slice( 0, 40 ), saves };

}

export function restoreSaveBackup( backup, storage = safeStorage() ) {

	if ( ! storage || ! isRecord( backup ) || ! isRecord( backup.saves ) ) throw new Error( 'Device storage is unavailable.' );
	const keys = [];
	if ( backup.saves.scenic ) keys.push( SCENIC_SAVE_KEY );
	if ( backup.saves.webgpu ) keys.push( ...MAIN_SAVE_KEYS );
	const original = new Map();
	try {

		for ( const key of keys ) original.set( key, storage.getItem( key ) );
		if ( backup.saves.webgpu ) {

			for ( const key of MAIN_SAVE_KEYS ) storage.removeItem( key );
			for ( const key of MAIN_SAVE_KEYS ) if ( hasOwn( backup.saves.webgpu, key ) ) storage.setItem( key, JSON.stringify( backup.saves.webgpu[ key ] ) );

		}
		if ( backup.saves.scenic ) storage.setItem( SCENIC_SAVE_KEY, JSON.stringify( backup.saves.scenic ) );

	} catch {

		for ( const [ key, raw ] of original ) {

			try { raw === null ? storage.removeItem( key ) : storage.setItem( key, raw ); } catch { /* Best-effort rollback if browser storage is full. */ }

		}
		throw new Error( 'The backup could not be restored. Existing progress was kept.' );

	}
	return { scenic: !! backup.saves.scenic, webgpu: !! backup.saves.webgpu };

}

export async function exportSaveBackupFile( text ) {

	const date = new Date().toISOString().slice( 0, 10 );
	const filename = `Fishing-Free-save-${ date }.json`;
	if ( Capacitor.isNativePlatform() ) {

		const [ fileSystem, share ] = await Promise.all( [ import( '@capacitor/filesystem' ), import( '@capacitor/share' ) ] );
		const saved = await fileSystem.Filesystem.writeFile( {
			path: filename,
			data: text,
			directory: fileSystem.Directory.Cache,
			encoding: fileSystem.Encoding.UTF8,
		} );
		await share.Share.share( { title: 'Fishing Free save backup', text: 'Save this file somewhere safe before reinstalling the game.', url: saved.uri, dialogTitle: 'Save your Fishing Free backup' } );
		return 'Share sheet opened. Choose a place to save the backup file.';

	}

	const blob = new Blob( [ text ], { type: 'application/json;charset=utf-8' } );
	const url = URL.createObjectURL( blob );
	const anchor = document.createElement( 'a' );
	anchor.href = url;
	anchor.download = filename;
	anchor.hidden = true;
	document.body.append( anchor );
	anchor.click();
	anchor.remove();
	setTimeout( () => URL.revokeObjectURL( url ), 30000 );
	return 'Backup download started. Save the file somewhere safe.';

}