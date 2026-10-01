import './touch-controls.css';

const coarsePointer = () => globalThis.matchMedia?.( '(pointer: coarse)' ).matches || ( navigator.maxTouchPoints || 0 ) > 0;

// Touch equivalents for the game's existing keyboard and mouse controls.
export class TouchControls {

	constructor( input ) {

		this.input = input;
		this.activeKeys = new Set();
		this.stickPointer = null;
		this.lookPointer = null;
		this.enabled = coarsePointer();
		if ( ! this.enabled ) return;

		this.root = document.createElement( 'div' );
		this.root.className = 'tw-mobile-controls';
		this.root.setAttribute( 'aria-label', 'Touch game controls' );
		this.root.innerHTML = `
			<div class="tw-mobile-look-zone" aria-label="Drag to look"><span>DRAG TO LOOK</span></div>
			<div class="tw-mobile-stick" role="group" aria-label="Movement joystick">
				<div class="tw-mobile-stick-ring"><div class="tw-mobile-stick-knob"></div></div>
				<span class="tw-mobile-control-caption">MOVE</span>
			</div>
			<div class="tw-mobile-actions" aria-label="Game actions"></div>
			<button class="tw-mobile-hold" type="button" aria-label="Cast, strike, or reel while held">CAST<br>HOLD</button>
		`;
		document.body.appendChild( this.root );

		this.lookZone = this.root.querySelector( '.tw-mobile-look-zone' );
		this.stick = this.root.querySelector( '.tw-mobile-stick' );
		this.knob = this.root.querySelector( '.tw-mobile-stick-knob' );
		this.actionBar = this.root.querySelector( '.tw-mobile-actions' );
		this.holdButton = this.root.querySelector( '.tw-mobile-hold' );

		this.createAction( 'Use', 'KeyE', 'Interact' );
		this.createAction( 'Tow', 'KeyB', 'Emergency tow to the harbor' );
		this.createAction( 'Rod', 'KeyR', 'Take out or stow fishing rod' );
		this.createAction( 'Journal', 'KeyI', 'Open cooler, fish guide, achievements and contracts' );
		this.createAction( 'View', 'KeyV', 'Change boat camera' );
		this.createAction( '↑', 'Space', 'Jump or swim up' );
		this.createAction( 'Dive', 'KeyC', 'Dive underwater' );
		this.createAction( 'Boost', 'ShiftLeft', 'Sprint or boost the boat' );
		this.createAction( 'Reel in', null, 'Retrieve an empty line', 2 );
		this.bindHold( this.holdButton, () => input.setVirtualButton( 0, true ), () => input.setVirtualButton( 0, false ) );
		this.bindLookZone();
		this.bindStick();
		window.addEventListener( 'blur', () => this.releaseControls() );

	}

	createAction( label, code, description, mouseButton = null ) {

		const button = document.createElement( 'button' );
		button.type = 'button';
		button.className = 'tw-mobile-action';
		button.textContent = label;
		button.setAttribute( 'aria-label', description );
		button.title = description;
		this.actionBar.appendChild( button );

		this.bindHold( button,
			() => mouseButton === null ? this.input.setVirtualKey( code, true ) : this.input.setVirtualButton( mouseButton, true ),
			() => mouseButton === null ? this.input.setVirtualKey( code, false ) : this.input.setVirtualButton( mouseButton, false ),
		);

	}

	bindHold( element, onDown, onUp ) {

		let pointer = null;
		const release = ( event ) => {
			if ( pointer === null || ( event && event.pointerId !== pointer ) ) return;
			pointer = null;
			onUp();
		};

		element.addEventListener( 'pointerdown', ( event ) => {
			if ( pointer !== null || event.pointerType === 'mouse' ) return;
			event.preventDefault();
			pointer = event.pointerId;
			element.setPointerCapture?.( event.pointerId );
			onDown();
		} );
		element.addEventListener( 'pointerup', release );
		element.addEventListener( 'pointercancel', release );
		element.addEventListener( 'lostpointercapture', release );

	}

	bindLookZone() {

		this.lookZone.addEventListener( 'pointerdown', ( event ) => {
			if ( event.pointerType === 'mouse' || this.lookPointer !== null ) return;
			event.preventDefault();
			this.lookPointer = { id: event.pointerId, x: event.clientX, y: event.clientY };
			this.lookZone.setPointerCapture?.( event.pointerId );
		} );
		this.lookZone.addEventListener( 'pointermove', ( event ) => {
			if ( ! this.lookPointer || event.pointerId !== this.lookPointer.id ) return;
			event.preventDefault();
			this.input.addLookDelta( ( event.clientX - this.lookPointer.x ) * 1.8, ( event.clientY - this.lookPointer.y ) * 1.8 );
			this.lookPointer.x = event.clientX;
			this.lookPointer.y = event.clientY;
		} );
		const stop = ( event ) => {
			if ( this.lookPointer && event.pointerId === this.lookPointer.id ) this.lookPointer = null;
		};
		this.lookZone.addEventListener( 'pointerup', stop );
		this.lookZone.addEventListener( 'pointercancel', stop );
		this.lookZone.addEventListener( 'lostpointercapture', stop );

	}

	bindStick() {

		this.stick.addEventListener( 'pointerdown', ( event ) => {
			if ( event.pointerType === 'mouse' || this.stickPointer !== null ) return;
			event.preventDefault();
			this.stickPointer = event.pointerId;
			this.stick.setPointerCapture?.( event.pointerId );
			this.updateStick( event );
		} );
		this.stick.addEventListener( 'pointermove', ( event ) => {
			if ( event.pointerId !== this.stickPointer ) return;
			event.preventDefault();
			this.updateStick( event );
		} );
		const stop = ( event ) => {
			if ( event.pointerId === this.stickPointer ) this.resetStick();
		};
		this.stick.addEventListener( 'pointerup', stop );
		this.stick.addEventListener( 'pointercancel', stop );
		this.stick.addEventListener( 'lostpointercapture', stop );

	}

	updateStick( event ) {

		const rect = this.stick.getBoundingClientRect();
		const radius = rect.width * 0.34;
		const dx = event.clientX - ( rect.left + rect.width / 2 );
		const dy = event.clientY - ( rect.top + rect.height / 2 );
		const length = Math.hypot( dx, dy );
		const scale = length > radius ? radius / length : 1;
		const x = dx * scale, y = dy * scale;
		this.knob.style.transform = `translate(${ x }px, ${ y }px)`;

		const next = new Set();
		if ( y < - radius * 0.25 ) next.add( 'KeyW' );
		if ( y > radius * 0.25 ) next.add( 'KeyS' );
		if ( x < - radius * 0.25 ) next.add( 'KeyA' );
		if ( x > radius * 0.25 ) next.add( 'KeyD' );
		for ( const code of this.activeKeys ) if ( ! next.has( code ) ) this.input.setVirtualKey( code, false );
		for ( const code of next ) if ( ! this.activeKeys.has( code ) ) this.input.setVirtualKey( code, true );
		this.activeKeys = next;

	}

	resetStick() {

		this.stickPointer = null;
		for ( const code of this.activeKeys ) this.input.setVirtualKey( code, false );
		this.activeKeys.clear();
		this.knob.style.transform = '';

	}

	releaseControls() {

		this.resetStick();
		this.input.releaseAll();
		this.lookPointer = null;

	}

}
