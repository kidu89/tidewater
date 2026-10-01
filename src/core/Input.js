// Keyboard / mouse input with pointer lock support.
export class Input {

	constructor( dom ) {

		this.dom = dom;
		this.keys = new Set();
		this.pressed = new Set();
		this.physicalKeys = new Set();
		this.virtualKeys = new Set();
		this.gamepadKeys = new Set();
		this.look = { x: 0, y: 0 };
		this.wheel = 0;
		this.mouseDown = false;
		this.rightDown = false;
		this.physicalButtons = new Set();
		this.virtualButtons = new Set();
		this.gamepadButtons = new Set();
		this.gamepadAxes = { moveX: 0, moveY: 0, lookX: 0, lookY: 0, leftTrigger: 0, rightTrigger: 0 };
		this.gamepadId = '';
		this._gamepadButtonsDown = new Set();
		this._gamepadAConsumed = false;
		this._gamepadNav = '';
		this._gamepadNavDelay = 0;
		this.locked = false;
		this.enabled = true;

		window.addEventListener( 'keydown', ( e ) => {

			if ( e.target && ( e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA' ) ) return;
			if ( ! this.keys.has( e.code ) ) this.pressed.add( e.code );
			this.physicalKeys.add( e.code );
			this.keys.add( e.code );
			if ( [ 'Space', 'ArrowUp', 'ArrowDown', 'Tab' ].includes( e.code ) ) e.preventDefault();

		} );
		window.addEventListener( 'keyup', ( e ) => {

			this.physicalKeys.delete( e.code );
			if ( ! this.virtualKeys.has( e.code ) && ! this.gamepadKeys.has( e.code ) ) this.keys.delete( e.code );

		} );
		window.addEventListener( 'blur', () => this.releaseAll() );

		dom.addEventListener( 'mousedown', ( e ) => {

			this.physicalButtons.add( e.button );
			this.updateButtons();

		} );
		window.addEventListener( 'mouseup', ( e ) => {

			this.physicalButtons.delete( e.button );
			this.updateButtons();

		} );
		dom.addEventListener( 'contextmenu', ( e ) => e.preventDefault() );
		window.addEventListener( 'mousemove', ( e ) => {

			if ( this.locked || this.mouseDown || this.rightDown ) {

				this.look.x += e.movementX;
				this.look.y += e.movementY;

			}

		} );
		dom.addEventListener( 'wheel', ( e ) => {

			this.wheel += Math.sign( e.deltaY );
			e.preventDefault();

		}, { passive: false } );

		document.addEventListener( 'pointerlockchange', () => {

			this.locked = document.pointerLockElement === dom;

		} );

	}

	requestLock() {

		if ( ! this.locked ) this.dom.requestPointerLock?.()?.catch?.( () => {} );

	}

	// Mobile controls feed the same state as a keyboard without synthesizing DOM events.
	setVirtualKey( code, down ) {

		if ( down ) {
			if ( ! this.keys.has( code ) ) this.pressed.add( code );
			this.virtualKeys.add( code );
			this.keys.add( code );
		} else {
			this.virtualKeys.delete( code );
			if ( ! this.physicalKeys.has( code ) && ! this.gamepadKeys.has( code ) ) this.keys.delete( code );
		}

	}

	setVirtualButton( button, down ) {

		if ( down ) this.virtualButtons.add( button );
		else this.virtualButtons.delete( button );
		this.updateButtons();

	}

	addLookDelta( x, y ) {

		this.look.x += x;
		this.look.y += y;

	}

	updateButtons() {

		this.mouseDown = this.physicalButtons.has( 0 ) || this.virtualButtons.has( 0 ) || this.gamepadButtons.has( 0 );
		this.rightDown = this.physicalButtons.has( 2 ) || this.virtualButtons.has( 2 ) || this.gamepadButtons.has( 2 );

	}

	updateGamepad( dt ) {

		let pads = [];
		try {
			pads = ( typeof navigator !== 'undefined' && navigator.getGamepads ? navigator.getGamepads() : null ) || [];
		} catch {
			// Gamepad access can be denied while the document is not active.
		}
		let pad = null;
		for ( const candidate of pads ) {
			if ( candidate && candidate.connected && candidate.mapping === 'standard' ) {
				pad = candidate;
				break;
			}
		}

		if ( ! pad ) {
			this._setGamepadState( new Set(), new Set(), null, '' );
			this._gamepadButtonsDown.clear();
			this._gamepadAConsumed = false;
			this._gamepadNav = '';
			this._gamepadNavDelay = 0;
			return;
		}
		if ( pad.id !== this.gamepadId ) this._gamepadButtonsDown.clear();

		const buttonDown = ( index ) => !! pad.buttons[ index ]?.pressed || ( pad.buttons[ index ]?.value || 0 ) > 0.55;
		const axis = ( index ) => {
			const value = pad.axes[ index ] || 0;
			const magnitude = Math.abs( value );
			return magnitude <= 0.18 ? 0 : Math.sign( value ) * ( magnitude - 0.18 ) / 0.82;
		};
		const axes = {
			moveX: axis( 0 ), moveY: axis( 1 ),
			lookX: axis( 2 ), lookY: axis( 3 ),
			leftTrigger: pad.buttons[ 6 ]?.value || 0,
			rightTrigger: pad.buttons[ 7 ]?.value || 0,
		};
		const ui = this._gamepadModal();
		const start = document.querySelector( '.tw-start.is-on' );
		const aDown = buttonDown( 0 );
		const justPressed = ( index ) => buttonDown( index ) && ! this._gamepadButtonsDown.has( index );
		const nextKeys = new Set();
		const nextButtons = new Set();

		if ( ui && aDown ) this._gamepadAConsumed = true;
		if ( start && justPressed( 0 ) ) {
			start.querySelector( '.tw-start-cta' )?.click();
			this._gamepadAConsumed = true;
		}
		if ( ! aDown ) this._gamepadAConsumed = false;

		if ( ui ) {
			if ( justPressed( 0 ) && ! start ) this._activateGamepadFocus( ui );
			if ( justPressed( 1 ) || justPressed( 9 ) ) this._backGamepadUI( ui );
			this._navigateGamepadUI( ui, axes, pad.buttons, dt );
			axes.moveX = 0;
			axes.moveY = 0;
		} else {
			if ( aDown && ! this._gamepadAConsumed ) nextKeys.add( 'KeyE' );
			if ( buttonDown( 1 ) ) nextKeys.add( 'KeyB' );
			if ( buttonDown( 2 ) ) nextKeys.add( 'KeyR' );
			if ( buttonDown( 3 ) ) nextKeys.add( 'KeyI' );
			if ( buttonDown( 4 ) ) nextKeys.add( 'ShiftLeft' );
			if ( buttonDown( 5 ) ) nextKeys.add( 'KeyV' );
			if ( buttonDown( 8 ) ) nextKeys.add( 'Tab' );
			if ( justPressed( 9 ) ) document.querySelector( '.tw-root .tw-rail-open' )?.click();
			if ( buttonDown( 10 ) ) nextKeys.add( 'Space' );
			if ( buttonDown( 11 ) ) nextKeys.add( 'KeyC' );
			if ( buttonDown( 12 ) ) nextKeys.add( 'KeyW' );
			if ( buttonDown( 13 ) ) nextKeys.add( 'KeyS' );
			if ( buttonDown( 14 ) ) nextKeys.add( 'KeyA' );
			if ( buttonDown( 15 ) ) nextKeys.add( 'KeyD' );
			if ( axes.leftTrigger > 0.35 ) nextButtons.add( 2 );
			if ( axes.rightTrigger > 0.35 ) nextButtons.add( 0 );
			const lookGain = Math.min( dt, 0.05 ) * 820;
			this.look.x += Math.sign( axes.lookX ) * axes.lookX * axes.lookX * lookGain;
			this.look.y += Math.sign( axes.lookY ) * axes.lookY * axes.lookY * lookGain;
		}

		this._setGamepadState( nextKeys, nextButtons, axes, pad.id );
		this._gamepadButtonsDown.clear();
		for ( let i = 0; i < pad.buttons.length; i ++ ) if ( buttonDown( i ) ) this._gamepadButtonsDown.add( i );

	}

	_setGamepadState( nextKeys, nextButtons, axes, id ) {

		for ( const code of this.gamepadKeys ) {
			if ( nextKeys.has( code ) ) continue;
			this.gamepadKeys.delete( code );
			if ( ! this.physicalKeys.has( code ) && ! this.virtualKeys.has( code ) ) this.keys.delete( code );
		}
		for ( const code of nextKeys ) {
			if ( ! this.keys.has( code ) ) this.pressed.add( code );
			this.gamepadKeys.add( code );
			this.keys.add( code );
		}
		this.gamepadButtons = nextButtons;
		this.gamepadAxes = axes || { moveX: 0, moveY: 0, lookX: 0, lookY: 0, leftTrigger: 0, rightTrigger: 0 };
		this.gamepadId = id;
		this.updateButtons();

	}

	_gamepadModal() {

		return document.querySelector( '.gm-guide.is-on, .tw-help.is-on, .gm-catch.is-on, .gm-inv.is-open, .gm-stand.is-open' ) ||
			document.querySelector( '.tw-root[data-panel="open"] .tw-panel' );

	}

	_gamepadFocusables( root ) {

		return [ ...root.querySelectorAll( 'button:not(:disabled), [role="tab"], [role="button"], input:not(:disabled), select:not(:disabled), [tabindex="0"]' ) ]
			.filter( ( element ) => ! element.hidden && element.getClientRects().length > 0 && getComputedStyle( element ).visibility !== 'hidden' );

	}

	_activateGamepadFocus( root ) {

		if ( root.matches( '.gm-guide' ) ) {
			root.querySelector( '.gm-guide-next' )?.click();
			return;
		}
		if ( root.matches( '.gm-catch' ) ) {
			root.querySelector( '[data-continue-catch]' )?.click();
			return;
		}
		const items = this._gamepadFocusables( root );
		const active = document.activeElement;
		const current = root.contains( active ) && items.includes( active ) ? active : null;
		const target = current || items.find( ( element ) => element.matches( '[role="tab"].is-active, .tw-tab.is-active, [data-continue-catch]' ) ) || items[ 0 ];
		if ( target ) {
			target.focus( { preventScroll: true } );
			if ( current ) target.click();
		}

	}

	_backGamepadUI( root ) {

		if ( root.matches( '.gm-guide' ) ) {
			root.querySelector( '.gm-guide-skip' )?.click();
			return;
		}
		if ( root.matches( '.tw-help' ) ) {
			root.querySelector( '.tw-help-close' )?.click();
			return;
		}
		if ( root.matches( '.gm-catch' ) ) {
			root.querySelector( '[data-continue-catch]' )?.click();
			return;
		}
		if ( root.matches( '.gm-inv, .gm-stand' ) ) {
			root.querySelector( '[data-close]' )?.click();
			return;
		}
		root.querySelector( '[aria-label*="Collapse"]' )?.click();

	}

	_navigateGamepadUI( root, axes, buttons, dt ) {

		const d = ( index ) => !! buttons[ index ]?.pressed;
		let direction = '';
		if ( Math.abs( axes.moveY ) > Math.abs( axes.moveX ) && Math.abs( axes.moveY ) > 0.55 ) direction = axes.moveY < 0 ? 'up' : 'down';
		else if ( Math.abs( axes.moveX ) > 0.55 ) direction = axes.moveX < 0 ? 'left' : 'right';
		else if ( d( 12 ) ) direction = 'up';
		else if ( d( 13 ) ) direction = 'down';
		else if ( d( 14 ) ) direction = 'left';
		else if ( d( 15 ) ) direction = 'right';

		if ( ! direction ) {
			this._gamepadNav = '';
			this._gamepadNavDelay = 0;
			return;
		}
		this._gamepadNavDelay -= Math.min( dt, 0.05 );
		if ( direction === this._gamepadNav && this._gamepadNavDelay > 0 ) return;
		const changed = direction !== this._gamepadNav;
		this._gamepadNav = direction;
		this._gamepadNavDelay = changed ? 0.35 : 0.2;
		const items = this._gamepadFocusables( root );
		if ( ! items.length ) return;
		const index = items.indexOf( document.activeElement );
		const step = direction === 'up' || direction === 'left' ? - 1 : 1;
		const next = index < 0 ? ( step < 0 ? items.length - 1 : 0 ) : ( index + step + items.length ) % items.length;
		items[ next ].focus( { preventScroll: true } );

	}

	releaseAll() {

		this.physicalKeys.clear();
		this.virtualKeys.clear();
		this.gamepadKeys.clear();
		this.keys.clear();
		this.pressed.clear();
		this.physicalButtons.clear();
		this.virtualButtons.clear();
		this.gamepadButtons.clear();
		this._gamepadButtonsDown.clear();
		this._gamepadAConsumed = false;
		this._gamepadNav = '';
		this._gamepadNavDelay = 0;
		this.gamepadAxes = { moveX: 0, moveY: 0, lookX: 0, lookY: 0, leftTrigger: 0, rightTrigger: 0 };
		this.updateButtons();

	}

	down( code ) {

		return this.enabled && this.keys.has( code );

	}

	// true once per physical key press
	hit( code ) {

		return this.enabled && this.pressed.has( code );

	}

	consumeLook() {

		const l = { x: this.look.x, y: this.look.y };
		this.look.x = 0;
		this.look.y = 0;
		return l;

	}

	consumeWheel() {

		const w = this.wheel;
		this.wheel = 0;
		return w;

	}

	endFrame() {

		this.pressed.clear();

	}

}
