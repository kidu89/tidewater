// Keyboard / mouse input with pointer lock support.
export class Input {

	constructor( dom ) {

		this.dom = dom;
		this.keys = new Set();
		this.pressed = new Set();
		this.physicalKeys = new Set();
		this.virtualKeys = new Set();
		this.look = { x: 0, y: 0 };
		this.wheel = 0;
		this.mouseDown = false;
		this.rightDown = false;
		this.physicalButtons = new Set();
		this.virtualButtons = new Set();
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
			if ( ! this.virtualKeys.has( e.code ) ) this.keys.delete( e.code );

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
			if ( ! this.physicalKeys.has( code ) ) this.keys.delete( code );
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

		this.mouseDown = this.physicalButtons.has( 0 ) || this.virtualButtons.has( 0 );
		this.rightDown = this.physicalButtons.has( 2 ) || this.virtualButtons.has( 2 );

	}

	releaseAll() {

		this.physicalKeys.clear();
		this.virtualKeys.clear();
		this.keys.clear();
		this.pressed.clear();
		this.physicalButtons.clear();
		this.virtualButtons.clear();
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
