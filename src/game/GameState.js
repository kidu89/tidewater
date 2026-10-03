import { FISH, fishValue, fishLengthCm } from './FishTable.js';
import { defaultUpgrades, gearStats, nextLevel, UPGRADES, FUEL_PRICE } from './Gear.js';
import { getAchievementProgress, HABITAT_KEYS } from './Achievements.js';
import { CONTRACTS, CONTRACT_IDS, getContractProgress } from './Contracts.js';
import { WEEKLY_BRIEFS, getNextUtcMonday, getUtcWeekId, getWeeklyBriefSpec } from './WeeklyBriefs.js';

// Keep the legacy keys so existing saves survive the Fishing Free rebrand.
const SAVE_KEY = 'tidewater.save.v2';
const LEGACY_SAVE_KEY = 'tidewater.save.v1';

// Everything the player owns: wallet, the fish in the cooler / hold, the fish log and the gear
// levels. Saved to localStorage (per browser) after every change; storage can be missing or throw
// (private windows, blocked site data), so every access is guarded and the game runs without it.
export class GameState {

	constructor( storage = safeStorage() ) {

		this.storage = storage;
		this.money = 0;
		this.inventory = []; // { id, species, kg, cm, value, caughtAt (game hours), record }
		this.log = {}; // species -> { count, bestKg, bestCm }
		// the last addFish: { species, kg, cm, value, newSpecies, record, prevBestKg, prevBestCm, kept } (the catch card)
		this.lastCatch = null;
		this.upgrades = defaultUpgrades();
		this.fuel = null; // litres left (null = full tank)
		this.career = emptyCareer();
		this.newAchievements = [];
		this._unlockedAchievements = new Set();
		this._nextId = 1;
		this.listeners = new Set();

	}

	get stats() {

		return gearStats( this.upgrades );

	}

	get achievementProgress() {

		return getAchievementProgress( this );

	}

	get contractProgress() {

		return getContractProgress( this );

	}

	get weeklyBrief() {

		const weekId = getUtcWeekId();
		const currentSpec = getWeeklyBriefSpec( weekId, this.career.locations );
		let saved = this.career.weeklyBrief;
		if ( ! saved || saved.weekId !== weekId || ! WEEKLY_BRIEFS.some( ( brief ) => brief.id === saved.id ) ) {

			saved = this.career.weeklyBrief = { weekId, id: currentSpec.id, progress: 0, claimed: false };
			this.save();

		}

		const spec = WEEKLY_BRIEFS.find( ( brief ) => brief.id === saved.id ) || currentSpec;
		const progress = Math.min( spec.target, safeCount( saved.progress ) );
		return {
			...spec,
			weekId,
			progress,
			progressText: `${ progress } / ${ spec.target } fish landed`,
			complete: progress >= spec.target,
			claimed: !! saved.claimed,
			resetsAt: getNextUtcMonday(),
		};

	}

	get holdKg() {

		let kg = 0;
		for ( const f of this.inventory ) kg += f.kg;
		return kg;

	}

	get holdValue() {

		let v = 0;
		for ( const f of this.inventory ) v += f.value;
		return v;

	}

	// room in the cooler / hold for a fish of `kg`?
	fits( kg ) {

		return this.holdKg + kg <= this.stats.holdKg + 1e-6;

	}

	// store a caught fish; returns the entry, or null when the hold is full (it is logged either way).
	// A record beats an earlier catch of the species; the first one of a species is a new species.
	addFish( species, kg, timeOfDay = 12, { habitat = null } = {} ) {

		kg = Math.round( kg * 100 ) / 100;
		const cm = Math.round( fishLengthCm( species, kg ) );
		const logEntry = this.log[ species ] || ( this.log[ species ] = { count: 0, bestKg: 0 } );
		const newSpecies = logEntry.count === 0;
		const prevBestKg = logEntry.bestKg, prevBestCm = logEntry.bestCm ?? ( prevBestKg > 0 ? Math.round( fishLengthCm( species, prevBestKg ) ) : 0 );
		const record = ! newSpecies && kg > prevBestKg;
		logEntry.count ++;
		if ( kg > prevBestKg ) {

			logEntry.bestKg = kg;
			logEntry.bestCm = cm;

		}

		const value = fishValue( species, kg );
		const kept = this.fits( kg );
		this.lastCatch = { species, kg, cm, value, newSpecies, record, prevBestKg, prevBestCm, kept };
		this.career.caught ++;
		if ( kept ) this.career.kept ++;
		if ( record ) this.career.records ++;
		this.career.bestCatchKg = Math.max( this.career.bestCatchKg, kg );
		if ( habitat ) {
			for ( const key of HABITAT_KEYS ) if ( habitat[ key ] >= 0.4 ) this.career.habitats[ key ] ++;
		}
		const brief = this.weeklyBrief;
		if ( ! brief.claimed && ! brief.complete && habitat?.[ brief.habitat ] >= 0.4 ) this.career.weeklyBrief.progress ++;
		if ( ! kept ) {

			this.save();
			this.emit();
			return null;

		}

		const f = { id: this._nextId ++, species, kg, cm, value, caughtAt: timeOfDay, record };
		this.inventory.push( f );
		this.save();
		this.emit();
		return f;

	}

	discoverLocation( id ) {

		if ( ! [ 'pelican-cay', 'turtle-key', 'mangrove-reach', 'sunspire-atoll' ].includes( id ) || this.career.locations.includes( id ) ) return false;
		this.career.locations.push( id );
		this.save();
		this.emit();
		return true;

	}

	claimContract( id ) {

		const contract = CONTRACTS.find( ( entry ) => entry.id === id );
		if ( ! contract || this.career.claimedContracts.includes( id ) || contract.current( this ) < contract.target ) return null;
		this.career.claimedContracts.push( id );
		this.money += contract.reward;
		this.save();
		this.emit();
		return contract;

	}

	claimWeeklyBrief() {

		const brief = this.weeklyBrief;
		if ( ! brief.complete || brief.claimed ) return null;
		this.career.weeklyBrief.claimed = true;
		this.money += brief.reward;
		this.save();
		this.emit();
		return brief;

	}

	// sell the given fish ids (all when omitted); returns the money made
	sell( ids = null ) {

		const keep = [], sold = [];
		for ( const f of this.inventory ) ( ids === null || ids.includes( f.id ) ? sold : keep ).push( f );
		let total = 0;
		for ( const f of sold ) total += f.value;
		this.inventory = keep;
		this.money += total;
		this.career.sold += sold.length;
		this.career.salesValue += total;
		this.save();
		this.emit();
		return { total, count: sold.length };

	}

	release( id ) {

		this.inventory = this.inventory.filter( ( f ) => f.id !== id );
		this.save();
		this.emit();

	}

	// spend money (upgrade shop); false when it can't be afforded
	spend( amount ) {

		if ( amount > this.money ) return false;
		this.money -= amount;
		this.save();
		this.emit();
		return true;

	}

	// buy the next level of an upgrade track; returns the new level entry or null
	buy( key ) {

		if ( ! UPGRADES[ key ] ) return null;
		const next = nextLevel( this.upgrades, key );
		if ( ! next || next.cost > this.money ) return null;
		this.money -= next.cost;
		this.upgrades[ key ] = next.index;
		if ( key === 'fuel' ) this.fuel = null; // a new tank comes full
		this.save();
		this.emit();
		return next;

	}

	get fuelL() {

		return this.fuel === null ? this.stats.fuelL : Math.min( this.fuel, this.stats.fuelL );

	}

	// burn litres (no save: that happens when the boat stops or at the next sale / purchase)
	burn( litres ) {

		this.fuel = Math.max( 0, this.fuelL - litres );
		return this.fuel;

	}

	refuelCost() {

		return Math.ceil( ( this.stats.fuelL - this.fuelL ) * FUEL_PRICE );

	}

	// fill up as far as the money goes; returns litres bought
	refuel() {

		const missing = this.stats.fuelL - this.fuelL;
		const litres = Math.min( missing, Math.floor( this.money / FUEL_PRICE ) );
		if ( litres <= 0 ) return 0;
		this.money -= Math.ceil( litres * FUEL_PRICE );
		this.fuel = this.fuelL + litres;
		if ( this.fuel >= this.stats.fuelL - 1e-3 ) this.fuel = null;
		this.save();
		this.emit();
		return litres;

	}

	onChange( fn ) {

		this.listeners.add( fn );
		return () => this.listeners.delete( fn );

	}

	emit() {

		const unlocked = this.achievementProgress.filter( ( achievement ) => achievement.unlocked );
		this.newAchievements = unlocked.filter( ( achievement ) => ! this._unlockedAchievements.has( achievement.id ) );
		this._unlockedAchievements = new Set( unlocked.map( ( achievement ) => achievement.id ) );
		for ( const fn of this.listeners ) fn( this );

	}

	toJSON() {

		return { v: 2, money: this.money, inventory: this.inventory, log: this.log, upgrades: this.upgrades, fuel: this.fuel, nextId: this._nextId, career: this.career };

	}

	fromJSON( d ) {

		if ( ! d || ( d.v !== 1 && d.v !== 2 ) ) return false;
		this.money = Number.isFinite( d.money ) ? d.money : 0;
		this.inventory = Array.isArray( d.inventory ) ? d.inventory.filter( ( f ) => f && FISH[ f.species ] && Number.isFinite( f.kg ) ) : [];
		// saves from before lengths were recorded
		for ( const f of this.inventory ) if ( ! Number.isFinite( f.cm ) ) f.cm = Math.round( fishLengthCm( f.species, f.kg ) );
		this.log = d.log && typeof d.log === 'object' ? d.log : {};
		for ( const [ k, v ] of Object.entries( this.log ) ) if ( FISH[ k ] && v && v.bestKg > 0 && ! Number.isFinite( v.bestCm ) ) v.bestCm = Math.round( fishLengthCm( k, v.bestKg ) );
		this.upgrades = { ...defaultUpgrades(), ...( d.upgrades || {} ) };
		this.fuel = Number.isFinite( d.fuel ) ? d.fuel : null;
		this._nextId = Math.max( d.nextId | 0, ...this.inventory.map( ( f ) => f.id + 1 ), 1 );
		this.career = normalizeCareer( d.career, this.inventory, this.log );
		this.newAchievements = [];
		this._unlockedAchievements = new Set( this.achievementProgress.filter( ( achievement ) => achievement.unlocked ).map( ( achievement ) => achievement.id ) );
		return true;

	}

	save() {

		if ( ! this.storage ) return;
		try {

			this.storage.setItem( SAVE_KEY, JSON.stringify( this.toJSON() ) );

		} catch ( e ) { /* storage full or blocked: keep playing */ }

	}

	load() {

		if ( ! this.storage ) return false;
		let raw = null;
		try { raw = this.storage.getItem( SAVE_KEY ); } catch ( e ) { /* storage unavailable */ }
		if ( raw ) try { if ( this.fromJSON( JSON.parse( raw ) ) ) return true; } catch ( e ) { /* try the previous version */ }
		try { raw = this.storage.getItem( LEGACY_SAVE_KEY ); } catch ( e ) { return false; }
		if ( raw ) try {
			if ( this.fromJSON( JSON.parse( raw ) ) ) {
				this.save();
				return true;
			}
		} catch ( e ) { /* invalid save: start a fresh career */ }
		return false;

	}

	reset() {

		this.money = 0;
		this.inventory = [];
		this.log = {};
		this.upgrades = defaultUpgrades();
		this.fuel = null;
		this.career = emptyCareer();
		this.newAchievements = [];
		this._unlockedAchievements.clear();
		this.save();
		this.emit();

	}

}

function emptyCareer() {

	return { caught: 0, kept: 0, sold: 0, salesValue: 0, records: 0, bestCatchKg: 0, locations: [], habitats: Object.fromEntries( HABITAT_KEYS.map( ( key ) => [ key, 0 ] ) ), claimedContracts: [], weeklyBrief: null };

}

function normalizeCareer( career, inventory, log ) {

	const result = emptyCareer();
	if ( career && typeof career === 'object' ) {
		for ( const key of [ 'caught', 'kept', 'sold', 'records' ] ) result[ key ] = safeCount( career[ key ] );
		result.salesValue = safeNumber( career.salesValue );
		result.bestCatchKg = safeNumber( career.bestCatchKg );
		result.locations = Array.isArray( career.locations ) ? career.locations.filter( ( id ) => [ 'pelican-cay', 'turtle-key', 'mangrove-reach', 'sunspire-atoll' ].includes( id ) ) : [];
		result.claimedContracts = Array.isArray( career.claimedContracts ) ? career.claimedContracts.filter( ( id ) => CONTRACT_IDS.has( id ) ) : [];
		const weeklyBrief = career.weeklyBrief;
		if ( weeklyBrief && typeof weeklyBrief === 'object' && typeof weeklyBrief.weekId === 'string' && /^\d{4}-W\d{2}$/.test( weeklyBrief.weekId ) ) {
			const spec = WEEKLY_BRIEFS.find( ( brief ) => brief.id === weeklyBrief.id );
			if ( spec ) result.weeklyBrief = { weekId: weeklyBrief.weekId, id: spec.id, progress: Math.min( spec.target, safeCount( weeklyBrief.progress ) ), claimed: !! weeklyBrief.claimed };
		}
		if ( career.habitats && typeof career.habitats === 'object' ) {
			for ( const key of HABITAT_KEYS ) result.habitats[ key ] = safeCount( career.habitats[ key ] );
		}
		return result;
	}

	// Older v1 saves have only per-species counts and current inventory, so migrate what is known.
	result.caught = Object.values( log ).reduce( ( total, entry ) => total + safeCount( entry?.count ), 0 );
	result.kept = inventory.length;
	result.bestCatchKg = Math.max( 0, ...Object.values( log ).map( ( entry ) => safeNumber( entry?.bestKg ) ) );
	return result;

}

function safeCount( value ) {

	return Number.isFinite( value ) ? Math.max( 0, Math.floor( value ) ) : 0;

}

function safeNumber( value ) {

	return Number.isFinite( value ) ? Math.max( 0, value ) : 0;

}

function safeStorage() {

	try {

		return typeof localStorage !== 'undefined' ? localStorage : null;

	} catch ( e ) {

		return null;

	}

}
