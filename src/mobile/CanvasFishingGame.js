import './CanvasFishingGame.css';
import { FISH, fishLengthCm, fishValue } from '../game/FishTable.js';
import { WEEKLY_BRIEFS, getUtcWeekId, getWeeklyBriefSpec } from '../game/WeeklyBriefs.js';
import { SCENIC_SAVE_KEY, normalizeScenicSave, createSaveBackup, parseSaveBackup, restoreSaveBackup, exportSaveBackupFile } from './SaveBackup.js';

// Preserve phone-mode progress from earlier builds under its original localStorage key.
const SAVE_KEY = SCENIC_SAVE_KEY;
const HOLD_LIMIT = 10;
const CATCH_GESTURE_GUARD_MS = 700;
const WATERS = [
	{ id: 'pier', label: 'Old Pier', habitat: 'pier', sea: '#2c8f9a', deep: '#145264', sky: '#86c9e6', scene: 'mobile-scenes/pier.webp', portraitScene: 'mobile-scenes-portrait/pier.webp', position: '94% 50%' },
	{ id: 'cay', label: 'Pelican Flats', habitat: 'cay', sea: '#4bb9a7', deep: '#257b80', sky: '#a1d9e8', scene: 'mobile-scenes/cay.webp', portraitScene: 'mobile-scenes-portrait/cay.webp', position: '10% 50%' },
	{ id: 'reef', label: 'Coral Reef', habitat: 'reef', sea: '#20a9aa', deep: '#155d70', sky: '#8fd1e8', scene: 'mobile-scenes/reef.webp', portraitScene: 'mobile-scenes-portrait/reef.webp', position: '52% 50%' },
	{ id: 'deep', label: 'Bluewater Drop', habitat: 'deep', sea: '#267d9b', deep: '#082c50', sky: '#74afd1', scene: 'mobile-scenes/deep.webp', portraitScene: 'mobile-scenes-portrait/deep.webp', position: '50% 52%' },
	{ id: 'mangrove', label: 'Mangrove Creek', habitat: 'mangrove', sea: '#388d78', deep: '#174d4a', sky: '#a0c9b9', scene: 'mobile-scenes/mangrove.webp', portraitScene: 'mobile-scenes-portrait/mangrove.webp', position: '52% 55%' },
	{ id: 'atoll', label: 'Sunspire Atoll', habitat: 'atoll', sea: '#2c9da7', deep: '#155766', sky: '#aadfe4', scene: 'mobile-scenes/atoll.webp', portraitScene: 'mobile-scenes-portrait/atoll.webp', position: '49% 52%' },
];
const SCENIC_HABITATS = WATERS.map( ( water ) => water.habitat );
const SCENIC_LOCATIONS = [ 'pelican-cay', 'mangrove-reach', 'sunspire-atoll' ];

const clamp = ( value, min, max ) => Math.max( min, Math.min( max, value ) );
const rand = ( min, max ) => min + Math.random() * ( max - min );
const money = ( value ) => '$' + Math.round( value ).toLocaleString( 'en-US' );

// Scenic touch-first fishing for phones whose browser cannot start the full 3D renderer.
// Full 3D stays the primary mode; this camera-scene mode keeps the visual style on unsupported devices.
export class CanvasFishingGame {

	constructor( root, { reason = '', graphicsDetails = {} } = {} ) {

		this.root = root;
		this.reason = reason;
		this.graphicsDetails = graphicsDetails;
		this.zone = WATERS[ 0 ];
		this.data = this.load();
		this.phase = 'ready';
		this.message = 'Choose a stretch of water, cast your line, and bring your catch back to Joe.';
		this.reeling = false;
		this.reelPointerActive = false;
		this.catchGestureGuardUntil = 0;
		this.progress = 0;
		this.tension = 32;
		this.lastFrame = 0;
		this.biteAt = 0;
		this.biteEndsAt = 0;
		this.target = null;
		this.lastUiTick = 0;
		this.startedAt = performance.now();
		this.makeUI();

	}

	load() {

		const empty = { cash: 0, rodLevel: 0, bag: [], collection: {}, catches: 0, bestKg: 0, weeklyBrief: null };
		try {

			return normalizeScenicSave( JSON.parse( localStorage.getItem( SAVE_KEY ) || 'null' ) ) || empty;

		} catch { return empty; }

	}
	save() {

		try { localStorage.setItem( SAVE_KEY, JSON.stringify( this.data ) ); } catch { /* the game still works when storage is full or disabled */ }

	}

	get weeklyBrief() {

		const weekId = getUtcWeekId();
		const currentSpec = getWeeklyBriefSpec( weekId, SCENIC_LOCATIONS, SCENIC_HABITATS );
		let saved = this.data.weeklyBrief;
		if ( ! saved || saved.weekId !== weekId || saved.id !== currentSpec.id ) {

			saved = this.data.weeklyBrief = { weekId, id: currentSpec.id, progress: 0, claimed: false };
			this.save();

		}

		const spec = WEEKLY_BRIEFS.find( ( brief ) => brief.id === saved.id ) || currentSpec;
		const progress = Math.min( spec.target, Math.max( 0, Number( saved.progress ) || 0 ) );
		return { ...spec, weekId, progress, complete: progress >= spec.target, claimed: !! saved.claimed };

	}

	makeUI() {

		this.root.innerHTML = `
			<div class="tw-lite">
				<img class="tw-lite__art" src="ui/keyart.jpg" data-scene-art alt="" aria-hidden="true">
				<div class="tw-lite__shade" aria-hidden="true"></div>
				<canvas class="tw-lite__scene" aria-hidden="true"></canvas>
				<header class="tw-lite__header">
					<div class="tw-lite__brand"><span class="tw-lite__eyebrow">AN ISLAND FISHING GAME</span><strong>FISHING FREE</strong></div>
					<div class="tw-lite__header-actions">
						<div class="tw-lite__cash"><span>WALLET</span><strong data-cash>$0</strong></div>
						<button class="tw-lite__log-button" type="button" data-log aria-label="Open fish log">LOGBOOK <span data-log-count>0/${ Object.keys( FISH ).length }</span></button>
					</div>
				</header>
				<div class="tw-lite__toast" role="status" aria-live="polite" data-message></div>
				<aside class="tw-lite__brief" aria-label="Weekly harbor brief">
					<div class="tw-lite__brief-main"><span class="tw-lite__brief-icon" data-brief-icon aria-hidden="true">⚓</span><div class="tw-lite__brief-copy"><span class="tw-lite__brief-kicker">WEEKLY HARBOR BRIEF</span><strong data-brief-title></strong><small data-brief-description></small></div><strong class="tw-lite__brief-count" data-brief-count></strong></div>
					<div class="tw-lite__brief-bottom"><div class="tw-lite__brief-track" role="progressbar" aria-label="Weekly brief progress" aria-valuemin="0" aria-valuemax="4" data-brief-track><span data-brief-fill></span></div><span class="tw-lite__brief-reward" data-brief-reward></span><span class="tw-lite__brief-claimed" data-brief-claimed hidden>CLAIMED</span><button class="tw-lite__brief-claim" type="button" data-claim-weekly hidden></button></div>
				</aside>
				<div class="tw-lite__bite" data-bite hidden>FISH ON THE LINE <span>Tap SET HOOK!</span></div>
				<div class="tw-lite__waters" role="group" aria-label="Choose fishing water" data-waters></div>
				<div class="tw-lite__hud">
					<div class="tw-lite__line-meter" data-meter-wrap hidden>
						<div class="tw-lite__meter-label"><span>LINE TENSION</span><span data-meter-value>32%</span></div>
						<div class="tw-lite__meter"><span data-meter></span></div>
						<small>Keep the bar out of the red. Release to ease the line.</small>
					</div>
					<div class="tw-lite__hold"><span>COOLER</span><strong data-hold>0 / 10 fish</strong></div>
					<div class="tw-lite__actions">
						<button class="tw-lite__primary" type="button" data-action>CAST LINE</button>
						<button class="tw-lite__dock" type="button" data-dock>DOCK · SELL CATCH</button>
						<button class="tw-lite__share" type="button" data-share hidden>SHARE CATCH</button>
					</div>
					<div class="tw-lite__upgrade" data-upgrade hidden></div>
					<p class="tw-lite__device-note"><span>${ this.graphicsDetails.nativeMobileApp ? `In-app fishing · Fishing Free ${ __FISHING_FREE_VERSION__ } · Progress saves on this phone` : `Scenic fishing · Fishing Free ${ __FISHING_FREE_VERSION__ } · Your progress saves on this device` }</span><span class="tw-lite__device-note-actions"><button type="button" data-graphics-info>GRAPHICS INFO</button></span></p>
				</div>
				<div class="tw-lite__modal" data-modal hidden></div>
			</div>`;

		this.art = this.root.querySelector( '[data-scene-art]' );
		this.canvas = this.root.querySelector( 'canvas' );
		this.ctx = this.canvas.getContext( '2d', { alpha: true } );
		// Photo art and touch fishing remain usable when a legacy WebView cannot allocate a 2D context.
		if ( ! this.ctx ) this.canvas.hidden = true;
		this.messageEl = this.root.querySelector( '[data-message]' );
		this.biteEl = this.root.querySelector( '[data-bite]' );
		this.actionButton = this.root.querySelector( '[data-action]' );
		this.dockButton = this.root.querySelector( '[data-dock]' );
		this.shareButton = this.root.querySelector( '[data-share]' );
		this.meterWrap = this.root.querySelector( '[data-meter-wrap]' );
		this.meter = this.root.querySelector( '[data-meter]' );
		this.meterValue = this.root.querySelector( '[data-meter-value]' );
		this.upgradeEl = this.root.querySelector( '[data-upgrade]' );
		this.watersEl = this.root.querySelector( '[data-waters]' );
		this.applySceneArt();
		this.makeWaterButtons();
		this.actionButton.addEventListener( 'click', ( event ) => {

			if ( performance.now() < this.catchGestureGuardUntil ) {

				event.preventDefault();
				event.stopPropagation();
				return;

			}

			if ( this.phase === 'fight' ) {

				if ( event.detail === 0 ) this.reeling = ! this.reeling;
				return;

			}
			this.act();

		} );
		this.actionButton.addEventListener( 'pointerdown', ( event ) => {

			if ( this.phase !== 'fight' ) return;
			event.preventDefault();
			this.reelPointerActive = true;
			this.reeling = true;
			this.actionButton.classList.add( 'is-reeling' );
			this.actionButton.setPointerCapture?.( event.pointerId );

		} );
		const releaseReel = () => {

			const pointerWasReeling = this.reelPointerActive;
			this.reelPointerActive = false;
			if ( pointerWasReeling && this.phase === 'caught' ) this.catchGestureGuardUntil = performance.now() + CATCH_GESTURE_GUARD_MS;
			this.reeling = false;
			this.actionButton.classList.remove( 'is-reeling' );

		};
		this.actionButton.addEventListener( 'pointerup', releaseReel );
		this.actionButton.addEventListener( 'pointercancel', releaseReel );
		this.actionButton.addEventListener( 'lostpointercapture', releaseReel );
		window.addEventListener( 'pointerup', releaseReel );
		this.dockButton.addEventListener( 'click', () => this.phase === 'dock' ? this.act() : this.visitDock() );
		this.shareButton.addEventListener( 'click', () => this.shareLastCatch() );
		this.root.querySelector( '[data-log]' ).addEventListener( 'click', () => this.showLogbook() );
		this.root.addEventListener( 'click', ( event ) => {

			const waterButton = event.target.closest( '[data-zone]' );
			if ( waterButton ) this.selectWater( waterButton.dataset.zone );
			if ( event.target.closest( '[data-close-log]' ) ) this.closeLogbook();
			if ( event.target.closest( '[data-graphics-info]' ) ) this.showGraphicsDetails();
			if ( event.target.closest( '[data-copy-graphics-info]' ) ) this.copyGraphicsDetails();
			if ( event.target.closest( '[data-retry-3d]' ) ) window.location.reload();
			if ( event.target.closest( '[data-upgrade-rod]' ) ) this.upgradeRod();
			if ( event.target.closest( '[data-claim-weekly]' ) ) this.claimWeeklyBrief();
			if ( event.target.closest( '[data-save-manager]' ) ) this.showSaveManager();
			if ( event.target.closest( '[data-export-save]' ) ) this.exportProgressBackup();
			if ( event.target.closest( '[data-import-save]' ) ) this.root.querySelector( '[data-save-file]' )?.click();

		} );
		this.root.addEventListener( 'change', ( event ) => {

			const picker = event.target.closest( '[data-save-file]' );
			if ( picker?.files?.[ 0 ] ) this.importProgressBackup( picker.files[ 0 ] );
			if ( picker ) picker.value = '';

		} );
		this.resize();
		window.addEventListener( 'resize', () => this.resize(), { passive: true } );
		this.renderUI();

	}

	makeWaterButtons() {

		this.watersEl.innerHTML = WATERS.map( ( water ) => `<button type="button" data-zone="${ water.id }" aria-pressed="${ water.id === this.zone.id }">${ water.label }</button>` ).join( '' );

	}

	resize() {

		const dpr = Math.min( window.devicePixelRatio || 1, 2 );
		const width = Math.max( 1, window.innerWidth ), height = Math.max( 1, window.innerHeight );
		this.canvas.width = Math.round( width * dpr );
		this.canvas.height = Math.round( height * dpr );
		this.canvas.style.width = width + 'px';
		this.canvas.style.height = height + 'px';
		this.ctx?.setTransform( dpr, 0, 0, dpr, 0, 0 );
		this.width = width;
		this.height = height;
		this.applySceneArt();

	}

	applySceneArt( water = this.zone ) {

		if ( ! this.art ) return;
		const portrait = window.innerHeight >= window.innerWidth;
		const scene = portrait && water.portraitScene ? water.portraitScene : water.scene;
		this.art.style.objectPosition = portrait && water.portraitScene ? '50% 50%' : water.position;
		if ( this.art.dataset.scene === scene ) return;
		this.art.classList.add( 'is-loading' );
		this.art.dataset.scene = scene;
		this.art.onload = () => this.art.classList.remove( 'is-loading' );
		this.art.onerror = () => {

			this.art.classList.remove( 'is-loading' );
			this.art.onerror = null;
			if ( scene !== water.scene ) {

				this.art.dataset.scene = water.scene;
				this.art.style.objectPosition = water.position;
				this.art.src = water.scene;

			}

		};
		this.art.src = scene;

	}

	start() {

		this.lastFrame = performance.now();
		this.frame = ( now ) => {

			const dt = Math.min( ( now - this.lastFrame ) / 1000, 0.05 );
			this.lastFrame = now;
			this.update( now, dt );
			this.draw( now / 1000 );
			this._raf = requestAnimationFrame( this.frame );

		};
		this._raf = requestAnimationFrame( this.frame );
		return this;

	}

	selectWater( id ) {

		if ( ! [ 'ready', 'caught', 'dock' ].includes( this.phase ) ) return;
		const next = WATERS.find( ( water ) => water.id === id );
		if ( ! next ) return;
		this.zone = next;
		this.applySceneArt( next );
		this.message = `${ next.label } selected. Different water brings different fish.`;
		this.renderUI();

	}

	act() {

		if ( this.phase === 'ready' || this.phase === 'caught' ) this.cast();
		else if ( this.phase === 'bite' ) this.setHook();
		else if ( this.phase === 'dock' ) {

			this.phase = 'ready';
			this.message = `Back on the water at ${ this.zone.label }. Cast when you're ready.`;
			this.renderUI();

		}

	}

	cast() {

		if ( this.data.bag.length >= HOLD_LIMIT ) {

			this.message = 'Your cooler is full. Head back to Joe at the dock to sell your catch.';
			this.renderUI();
			return;

		}
		this.phase = 'waiting';
		this.target = this.chooseFish();
		this.biteAt = performance.now() + rand( 3300, this.zone.id === 'deep' ? 8500 : 7000 );
		this.message = `Line in the water at ${ this.zone.label }. Watch the bobber for a bite.`;
		this.renderUI();

	}

	chooseFish() {

		const choices = Object.keys( FISH ).map( ( id ) => ( { id, fish: FISH[ id ], weight: ( FISH[ id ].habitat[ this.zone.habitat ] || 0 ) * ( 1.25 - FISH[ id ].rarity ) } ) ).filter( ( entry ) => entry.weight > 0 );
		const sum = choices.reduce( ( total, entry ) => total + entry.weight, 0 );
		let roll = Math.random() * sum;
		for ( const entry of choices ) {

			roll -= entry.weight;
			if ( roll <= 0 ) return entry;

		}
		return choices[ choices.length - 1 ];

	}

	setHook() {

		if ( performance.now() > this.biteEndsAt ) {

			this.missFish();
			return;

		}
		this.phase = 'fight';
		this.progress = 0;
		this.tension = 34;
		this.fightClock = 0;
		this.message = `You've hooked a ${ this.target.fish.name.toLowerCase() }. Hold REEL to bring it closer; release when the line strains.`;
		this.renderUI();
		if ( navigator.vibrate ) navigator.vibrate( [ 55, 35, 85 ] );

	}

	missFish() {

		this.phase = 'ready';
		this.target = null;
		this.reeling = false;
		this.message = 'The fish got away. Watch for the next bite and tap SET HOOK quickly.';
		this.renderUI();

	}

	update( now, dt ) {

		if ( this.phase === 'waiting' && now >= this.biteAt ) {

			this.phase = 'bite';
			this.biteEndsAt = now + 5200;
			this.message = 'A fish is tugging at the bait! Tap SET HOOK now.';
			this.renderUI();
			if ( navigator.vibrate ) navigator.vibrate( [ 70, 45, 140 ] );

		} else if ( this.phase === 'bite' && now > this.biteEndsAt ) this.missFish();

		if ( this.phase === 'fight' && this.target ) {

			this.fightClock += dt;
			const pull = 0.24 + this.target.fish.fight * 0.72 + ( Math.sin( this.fightClock * ( 2.8 + this.target.fish.fight * 2.4 ) ) + 1 ) * 0.12;
			if ( this.reeling ) this.tension += dt * ( 26 + pull * 30 );
			else this.tension += dt * ( pull * 18 - 20 );
			this.tension = clamp( this.tension, 0, 100 );
			if ( this.reeling && this.tension > 13 && this.tension < 78 ) {

				const effort = 1 / Math.max( 2, this.target.fish.stamina * ( 0.72 - this.data.rodLevel * 0.08 ) );
				this.progress += dt * effort * ( 1.08 - this.target.fish.fight * 0.32 );

			}
			if ( this.tension >= 97 ) {

				this.phase = 'ready';
				this.target = null;
				this.reeling = false;
				this.message = 'The line snapped under pressure. Ease off the reel when the bar climbs.';
				this.renderUI();

			} else if ( this.progress >= 1 ) this.landFish();
			if ( now - this.lastUiTick > 90 ) {

				this.lastUiTick = now;
				this.meter.style.width = this.tension + '%';
				this.meter.style.background = this.tension > 76 ? 'var(--lite-red)' : this.tension > 58 ? 'var(--lite-gold)' : 'var(--lite-aqua)';
				this.meterValue.textContent = Math.round( this.tension ) + '%';

			}

		}

	}

	landFish() {

		const entry = this.target;
		const fish = entry.fish;
		const [ minKg, maxKg ] = fish.kg;
		const kg = Math.round( ( minKg + ( maxKg - minKg ) * Math.pow( Math.random(), 1.7 ) * ( 1 + this.data.rodLevel * 0.07 ) ) * 100 ) / 100;
		const value = fishValue( entry.id, kg );
		const collection = this.data.collection[ entry.id ] || { count: 0, bestKg: 0 };
		const first = collection.count === 0;
		const previousBestKg = collection.bestKg;
		const record = kg > collection.bestKg;
		collection.count ++;
		collection.bestKg = Math.max( kg, collection.bestKg );
		this.data.collection[ entry.id ] = collection;
		this.data.catches ++;
		this.data.bestKg = Math.max( kg, this.data.bestKg );
		const brief = this.weeklyBrief;
		if ( ! brief.claimed && ! brief.complete && fish.habitat?.[ brief.habitat ] >= 0.4 ) this.data.weeklyBrief.progress ++;
		if ( this.data.bag.length < HOLD_LIMIT ) this.data.bag.push( { species: entry.id, kg, value } );
		this.lastCatch = {
			species: entry.id, kg, cm: Math.round( fishLengthCm( entry.id, kg ) ), value,
			newSpecies: first, record, prevBestKg: previousBestKg, kept: this.data.bag.length <= HOLD_LIMIT,
		};
		if ( this.reelPointerActive ) this.catchGestureGuardUntil = performance.now() + CATCH_GESTURE_GUARD_MS;
		this.save();
		this.phase = 'caught';
		this.target = null;
		this.reeling = false;
		const tag = first ? 'New species!' : record ? 'New personal best!' : 'Nice catch!';
		this.message = `${ tag } ${ fish.name} · ${ kg.toFixed( 2 ) } kg · ${ money( value )} at Joe's stand.`;
		this.renderUI();
		if ( navigator.vibrate ) navigator.vibrate( [ 35, 30, 35 ] );

	}

	claimWeeklyBrief() {

		const brief = this.weeklyBrief;
		if ( ! brief.complete || brief.claimed ) return;
		this.data.weeklyBrief.claimed = true;
		this.data.cash += brief.reward;
		this.message = 'Harbor brief complete! Joe paid ' + money( brief.reward ) + '. Your reward is in your wallet.';
		this.save();
		this.renderUI();
		if ( navigator.vibrate ) navigator.vibrate( [ 40, 30, 65 ] );

	}

	async shareLastCatch() {

		if ( ! this.lastCatch || this.shareButton.disabled || this.reelPointerActive || performance.now() < this.catchGestureGuardUntil ) return;
		this.shareButton.disabled = true;
		this.shareButton.textContent = 'PREPARING CATCH CARD…';
		try {

			const { shareCatch } = await import( '../game/CatchShare.js' );
			const result = await shareCatch( this.lastCatch, FISH[ this.lastCatch.species ], null );
			this.message = result.startsWith( 'copied' )
				? 'Catch details copied. Your catch is saved in the logbook.'
				: 'Catch card shared. Your catch is saved in the logbook.';

		} catch ( error ) {

			this.message = error?.name === 'AbortError'
				? 'Share sheet closed. Your catch is safe in the logbook.'
				: 'Sharing is unavailable on this device. Your catch is safe in the logbook.';

		} finally {

			this.shareButton.disabled = false;
			this.shareButton.textContent = 'SHARE CATCH';
			this.renderUI();

		}

	}

	visitDock() {

		this.phase = 'dock';
		this.reeling = false;
		this.target = null;
		if ( this.data.bag.length ) {

			const count = this.data.bag.length;
			const total = this.data.bag.reduce( ( sum, fish ) => sum + fish.value, 0 );
			this.data.cash += total;
			this.data.bag = [];
			this.message = `Joe bought ${ count } fish for ${ money( total ) }. Your wallet now holds ${ money( this.data.cash )}.`;
			this.save();

		} else this.message = 'You are at the dock. Sell your catch here, then upgrade your rod before the next trip.';
		this.renderUI();

	}

	upgradeRod() {

		const costs = [ 180, 700, 2200 ];
		const cost = costs[ this.data.rodLevel ];
		if ( cost == null || this.data.cash < cost ) return;
		this.data.cash -= cost;
		this.data.rodLevel ++;
		this.message = `Rod upgraded to level ${ this.data.rodLevel + 1 }. Fish tire faster and you can land heavier catches.`;
		this.save();
		this.renderUI();

	}

	showLogbook() {

		const entries = Object.keys( this.data.collection ).filter( ( id ) => this.data.collection[ id ].count > 0 )
			.sort( ( a, b ) => FISH[ a ].name.localeCompare( FISH[ b ].name ) );
		const rows = entries.map( ( id ) => {

			const record = this.data.collection[ id ];
			return `<li><span>${ FISH[ id ].name }</span><strong>${ record.count } caught · best ${ record.bestKg.toFixed( 2 ) } kg</strong></li>`;

		} ).join( '' );
		this.root.querySelector( '[data-modal]' ).innerHTML = `<section class="tw-lite__dialog" role="dialog" aria-modal="true" aria-label="Fish logbook"><div class="tw-lite__dialog-top"><div><span>YOUR ISLAND JOURNAL</span><h2>Fish logbook</h2></div><button type="button" data-close-log aria-label="Close logbook">×</button></div><p>${ entries.length } of ${ Object.keys( FISH ).length } species discovered · ${ this.data.catches } fish landed · personal best ${ this.data.bestKg.toFixed( 2 ) } kg</p><ul>${ rows || '<li class="tw-lite__empty">No fish recorded yet. Cast a line to begin your collection.</li>' }</ul><button class="tw-lite__secondary tw-lite__save-manage" type="button" data-save-manager>BACK UP / RESTORE PROGRESS</button><button class="tw-lite__primary" type="button" data-close-log>BACK TO THE WATER</button></section>`;
		this.root.querySelector( '[data-modal]' ).hidden = false;

	}

	showSaveManager( status = '' ) {

		const modal = this.root.querySelector( '[data-modal]' );
		modal.innerHTML = "<section class='tw-lite__dialog tw-lite__save-dialog' role='dialog' aria-modal='true' aria-label='Back up or restore progress'><div class='tw-lite__dialog-top'><div><span>PROTECT YOUR PROGRESS</span><h2>Save backup</h2></div><button type='button' data-close-log aria-label='Close save backup'>×</button></div><p>Your backup includes this fishing career and any 3D career saved on this device. Keep the JSON file somewhere safe before changing or reinstalling the app.</p><div class='tw-lite__save-actions'><button class='tw-lite__secondary' type='button' data-export-save>EXPORT BACKUP FILE</button><button class='tw-lite__secondary' type='button' data-import-save>RESTORE FROM BACKUP</button><input type='file' accept='application/json,.json,text/json' data-save-file hidden></div><small class='tw-lite__save-status' data-save-status role='status' aria-live='polite'></small><button class='tw-lite__primary' type='button' data-close-log>DONE</button></section>";
		modal.querySelector( '[data-save-status]' ).textContent = status;
		modal.hidden = false;

	}

	async exportProgressBackup() {

		const status = this.root.querySelector( '[data-save-status]' );
		if ( status ) status.textContent = 'Preparing your backup…';
		try {

			const backup = createSaveBackup( this.data, window.localStorage, __FISHING_FREE_VERSION__ );
			const message = await exportSaveBackupFile( backup );
			const currentStatus = this.root.querySelector( '[data-save-status]' );
			if ( currentStatus ) currentStatus.textContent = message;

		} catch ( error ) {

			const currentStatus = this.root.querySelector( '[data-save-status]' );
			if ( currentStatus ) currentStatus.textContent = error?.message || 'Could not create the backup file. Try again.';

		}

	}

	async importProgressBackup( file ) {

		const status = this.root.querySelector( '[data-save-status]' );
		if ( ! file ) return;
		if ( status ) status.textContent = 'Reading your backup…';
		try {

			if ( file.size > 1024 * 1024 ) throw new Error( 'The backup file is too large.' );
			const backup = parseSaveBackup( await file.text() );
			if ( ! window.confirm( 'Restore the progress contained in this backup? It will replace progress for the included game modes on this device.' ) ) {

				if ( status ) status.textContent = 'Restore cancelled. Your current progress is unchanged.';
				return;

			}
			const restored = restoreSaveBackup( backup, window.localStorage );
			if ( backup.saves.scenic ) this.data = backup.saves.scenic;
			this.renderUI();
			const message = restored.scenic && restored.webgpu
				? 'Scenic and 3D progress restored. Restart the game to reload the 3D career.'
				: restored.webgpu ? '3D progress restored. Restart the game to reload that career.' : 'Scenic Fishing progress restored.';
			this.showSaveManager( message );

		} catch ( error ) {

			const currentStatus = this.root.querySelector( '[data-save-status]' );
			if ( currentStatus ) currentStatus.textContent = error?.message || 'Could not restore this backup. Your current progress is unchanged.';

		}

	}

	showGraphicsDetails() {

		const labels = {
			appVersion: 'Game version', mode: 'Rendering mode', osVersion: 'Operating system', engineVersion: 'Browser engine',
			secureContext: 'Secure graphics context', webgpuApi: 'WebGPU API', adapterProbe: 'Adapter result',
			adapterDetails: 'Graphics adapter', adapterAttempts: 'Adapter attempts', reason: 'Fallback reason',
		};
		const rows = Object.entries( labels ).map( ( [ key, label ] ) => `<li><span>${ label }</span><strong data-graphics-value="${ key }">Checking…</strong></li>` ).join( '' );
		const modal = this.root.querySelector( '[data-modal]' );
		modal.innerHTML = `<section class="tw-lite__dialog" role="dialog" aria-modal="true" aria-label="Graphics diagnostics"><div class="tw-lite__dialog-top"><div><span>DEVICE CHECK</span><h2>Graphics details</h2></div><button type="button" data-close-log aria-label="Close graphics details">×</button></div><p>This report stays on this device. It can show why full 3D did not start.</p><ul>${ rows }</ul><button class="tw-lite__primary" type="button" data-copy-graphics-info>COPY DEVICE REPORT</button><button class="tw-lite__secondary" type="button" data-retry-3d>RETRY FULL 3D</button><small class="tw-lite__diagnostic-status" data-graphics-copy-status aria-live="polite"></small><button class="tw-lite__secondary" type="button" data-close-log>BACK TO THE WATER</button></section>`;
		for ( const [ key, value ] of Object.entries( this.graphicsDetails ) ) {
			const field = modal.querySelector( `[data-graphics-value="${ key }"]` );
			if ( field ) field.textContent = String( value ).slice( 0, 180 );
		}
		modal.hidden = false;

	}

	async copyGraphicsDetails() {

		const report = Object.entries( this.graphicsDetails ).map( ( [ key, value ] ) => `${ key }: ${ value }` ).join( '\n' );
		let copied = false;
		try {
			await navigator.clipboard.writeText( report );
			copied = true;
		} catch {
			const field = document.createElement( 'textarea' );
			field.value = report;
			field.setAttribute( 'readonly', '' );
			field.style.position = 'fixed';
			field.style.opacity = '0';
			this.root.append( field );
			field.select();
			try { copied = document.execCommand( 'copy' ); } catch { copied = false; }
			field.remove();
		}
		const status = this.root.querySelector( '[data-graphics-copy-status]' );
		if ( status ) status.textContent = copied ? 'Copied. You can paste this report into your message.' : 'Copy unavailable. You can take a screenshot of these details.';

	}

	closeLogbook() {

		this.root.querySelector( '[data-modal]' ).hidden = true;

	}

	renderUI() {

		this.messageEl.textContent = this.message;
		this.biteEl.hidden = this.phase !== 'bite';
		this.meterWrap.hidden = this.phase !== 'fight';
		this.actionButton.disabled = this.phase === 'waiting';
		this.shareButton.hidden = this.phase !== 'caught' || ! this.lastCatch;
		this.actionButton.classList.toggle( 'is-reeling', this.phase === 'fight' && this.reeling );
		this.actionButton.textContent = {
			ready: 'CAST LINE', waiting: 'WAIT FOR A BITE', bite: 'SET HOOK!', fight: 'HOLD TO REEL', caught: 'CAST AGAIN', dock: 'RETURN TO THE WATER',
		}[ this.phase ] || 'CAST LINE';
		this.dockButton.textContent = this.phase === 'dock' ? 'BACK TO FISHING' : `DOCK · SELL ${ money( this.data.bag.reduce( ( sum, fish ) => sum + fish.value, 0 ) )}`;
		this.root.querySelector( '[data-cash]' ).textContent = money( this.data.cash );
		this.root.querySelector( '[data-hold]' ).textContent = `${ this.data.bag.length } / ${ HOLD_LIMIT } fish`;
		const species = Object.keys( this.data.collection ).filter( ( id ) => this.data.collection[ id ].count > 0 ).length;
		this.root.querySelector( '[data-log-count]' ).textContent = `${ species }/${ Object.keys( FISH ).length }`;
		const brief = this.weeklyBrief;
		this.root.querySelector( '[data-brief-icon]' ).textContent = brief.icon;
		this.root.querySelector( '[data-brief-title]' ).textContent = brief.title;
		this.root.querySelector( '[data-brief-description]' ).textContent = brief.description;
		this.root.querySelector( '[data-brief-count]' ).textContent = brief.progress + ' / ' + brief.target;
		const briefTrack = this.root.querySelector( '[data-brief-track]' );
		briefTrack.setAttribute( 'aria-valuemax', String( brief.target ) );
		briefTrack.setAttribute( 'aria-valuenow', String( brief.progress ) );
		this.root.querySelector( '[data-brief-fill]' ).style.width = ( brief.progress / brief.target * 100 ) + '%';
		this.root.querySelector( '[data-brief-reward]' ).textContent = 'REWARD ' + money( brief.reward );
		this.root.querySelector( '[data-brief-claimed]' ).hidden = ! brief.claimed;
		const claimBrief = this.root.querySelector( '[data-claim-weekly]' );
		claimBrief.hidden = ! brief.complete || brief.claimed;
		claimBrief.textContent = 'CLAIM ' + money( brief.reward );
		for ( const button of this.watersEl.querySelectorAll( '[data-zone]' ) ) button.setAttribute( 'aria-pressed', String( button.dataset.zone === this.zone.id ) );
		const costs = [ 180, 700, 2200 ];
		const cost = costs[ this.data.rodLevel ];
		this.upgradeEl.hidden = this.phase !== 'dock';
		if ( this.phase === 'dock' ) this.upgradeEl.innerHTML = cost == null ? '<span>Maximum rod level reached</span>' : `<span>ROD LEVEL ${ this.data.rodLevel + 1 }</span><button type="button" data-upgrade-rod ${ this.data.cash < cost ? 'disabled' : '' }>UPGRADE · ${ money( cost ) }</button>`;
		this.actionButton.setAttribute( 'aria-label', this.phase === 'fight' ? 'Hold to reel in the fish' : this.actionButton.textContent );

	}

	draw( time ) {

		const ctx = this.ctx, w = this.width, h = this.height;
		if ( ! ctx ) return;
		ctx.clearRect( 0, 0, w, h );
		const tint = {
			pier: 'rgba(8,39,48,.035)', cay: 'rgba(202,164,91,.055)', reef: 'rgba(20,147,148,.065)',
			deep: 'rgba(13,42,88,.095)', mangrove: 'rgba(24,88,65,.075)',
		}[ this.zone.id ];
		ctx.fillStyle = tint;
		ctx.fillRect( 0, 0, w, h );

		// Fine moving highlights keep the photographic water alive without painting a flat illustration over it.
		const horizon = h * 0.39;
		for ( let i = 0; i < 11; i ++ ) {

			const phase = ( time * ( 10 + i * 1.3 ) + i * 83 ) % ( w + 100 );
			const x = phase - 50;
			const y = horizon + 16 + ( i * 19 ) % Math.max( 1, Math.round( h * 0.14 ) );
			ctx.beginPath();
			ctx.moveTo( x, y );
			ctx.bezierCurveTo( x + 7, y - 1.5, x + 15, y + 1.5, x + 25 + ( i % 4 ) * 4, y );
			ctx.strokeStyle = i % 3 === 0 ? 'rgba(233,250,229,.21)' : 'rgba(229,246,239,.12)';
			ctx.lineWidth = i % 4 === 0 ? 1.5 : 1;
			ctx.lineCap = 'round';
			ctx.stroke();

		}

		if ( this.phase === 'bite' || this.phase === 'fight' || this.phase === 'waiting' ) this.drawFishingLine( time, h );
		if ( this.phase === 'fight' ) this.drawWaterFight( time, h );

	}

	drawFishingLine( time, h ) {

		const ctx = this.ctx, w = this.width;
		const originX = w * 0.57, originY = h * 0.625 + Math.sin( time * 1.7 ) * 1.5;
		const progress = this.phase === 'waiting' ? clamp( 1 - ( this.biteAt - performance.now() ) / 2800, 0.08, 0.94 ) : 0.93;
		const x = originX + w * ( 0.12 + progress * 0.22 );
		const y = h * ( 0.475 + Math.sin( time * 2.1 ) * 0.004 );
		ctx.beginPath();
		ctx.moveTo( originX, originY );
		ctx.quadraticCurveTo( w * 0.77, h * 0.58, x, y );
		ctx.strokeStyle = 'rgba(16,40,43,.68)';
		ctx.lineWidth = 2.2;
		ctx.stroke();
		ctx.strokeStyle = 'rgba(255,249,226,.78)';
		ctx.lineWidth = 0.85;
		ctx.stroke();
		ctx.beginPath();
		ctx.arc( x, y, this.phase === 'bite' ? 5 + Math.sin( time * 15 ) * 1.5 : 3.2, 0, Math.PI * 2 );
		ctx.fillStyle = this.phase === 'bite' ? '#ff806b' : '#f6d99d';
		ctx.shadowColor = this.phase === 'bite' ? 'rgba(255,108,85,.75)' : 'rgba(255,236,186,.6)';
		ctx.shadowBlur = this.phase === 'bite' ? 15 : 7;
		ctx.fill();
		ctx.shadowBlur = 0;
		if ( this.phase === 'bite' || this.phase === 'fight' ) {

			for ( let i = 0; i < 2; i ++ ) {

				ctx.beginPath();
				ctx.ellipse( x, y + 3, 10 + i * 8 + Math.sin( time * 8 + i ) * 2, 2.6 + i * 1.5, 0, 0, Math.PI * 2 );
				ctx.strokeStyle = 'rgba(231,247,232,' + ( 0.56 - i * 0.18 ) + ')';
				ctx.lineWidth = 1.2;
				ctx.stroke();

			}

		}

	}

	drawWaterFight( time, h ) {

		const ctx = this.ctx, x = this.width * ( 0.72 + Math.sin( time * 2 ) * 0.035 ), y = h * 0.48;
		const pulse = ( Math.sin( time * 8 ) + 1 ) * 0.5;
		for ( let i = 0; i < 4; i ++ ) {

			ctx.beginPath();
			ctx.ellipse( x, y, 8 + i * 10 + pulse * 5, 3 + i * 2 + pulse * 1.5, 0, 0, Math.PI * 2 );
			ctx.strokeStyle = 'rgba(232,251,240,' + ( 0.48 - i * 0.09 ) + ')';
			ctx.lineWidth = 1.4;
			ctx.stroke();

		}

	}

}
