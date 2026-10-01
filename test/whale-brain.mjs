// CPU-only regression checks for the humpback's scripted breach.
import { WhaleBrain } from '../src/world/marine/WhaleBrain.js';

let fails = 0;
const ok = ( condition, message ) => {

	if ( condition ) console.log( 'ok  ', message );
	else { fails ++; console.log( 'FAIL', message ); }

};

const whale = new WhaleBrain( { terrain: { heightAt: () => - 50 }, seed: 1 } );
whale.state = 'surface';
whale.water = 0;
whale.y = - 9;
whale.vy = 0;
whale.seq = {
	keys: [
		{ t: 1, depth: 9, pitch: 0, arch: 0, follow: 0.6, speed: 2.4, stroke: 0.1 },
		{ t: 7, depth: 9, pitch: 0.45, arch: 0, follow: 0.3, speed: 3.5, stroke: 0.14, breach: 'launch' },
		{ t: 6, depth: 2, pitch: 0, arch: 0, follow: 0.3, speed: 2.5, stroke: 0.05, breach: 'air' },
		{ t: 6, depth: 2.4, pitch: 0.05, arch: 0, follow: 0.85, speed: 1.5, stroke: 0.05 },
	],
	i: 1,
	t: 0,
	blown: false,
};

let peak = whale.y;
let returnedBelowSurface = false;
for ( let i = 0; i < 15 * 60; i ++ ) {

	whale.update( 1 / 60 );
	peak = Math.max( peak, whale.y );
	if ( i > 8 * 60 && whale.y < whale.water ) returnedBelowSurface = true;

}

ok( whale.breaches === 1, 'the breach transitions from launch to air once' );
ok( peak < 3, `the whale reaches a dramatic but controlled peak (${ peak.toFixed( 2 ) } m above water)` );
ok( returnedBelowSurface, 'the whale settles back below the surface after the breach' );

console.log( fails ? `${ fails } FAILED` : 'all passed' );
process.exit( fails ? 1 : 0 );
