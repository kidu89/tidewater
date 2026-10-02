// CPU-only regression checks for the humpback's scripted breach.
import { WhaleBrain } from '../src/world/marine/WhaleBrain.js';
import { TerrainData } from '../src/world/TerrainData.js';

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
let maxPitch = Math.abs( whale.pitch );
let maxRoll = Math.abs( whale.breachRoll );
let returnedBelowSurface = false;
for ( let i = 0; i < 15 * 60; i ++ ) {

	const inBreach = !! whale.seq?.keys[ whale.seq.i ]?.breach;
	whale.update( 1 / 60 );
	peak = Math.max( peak, whale.y );
	if ( inBreach ) {

		maxPitch = Math.max( maxPitch, Math.abs( whale.pitch ) );
		maxRoll = Math.max( maxRoll, Math.abs( whale.breachRoll ) );

	}
	if ( i > 8 * 60 && whale.y < whale.water ) returnedBelowSurface = true;

}

ok( whale.breaches === 1, 'the breach transitions from launch to air once' );
ok( peak < - 0.4, `the whale's body root remains submerged (${ peak.toFixed( 2 ) } m)` );
ok( maxPitch < 0.1, `the long body stays nearly level through the breach (${ ( maxPitch * 180 / Math.PI ).toFixed( 1 ) }°)` );
ok( maxRoll < 0.6, `the whale does not roll onto its back (${ ( maxRoll * 180 / Math.PI ).toFixed( 1 ) }°)` );
ok( returnedBelowSurface, 'the whale settles back below the surface after the breach' );

const terrain = new TerrainData();
const coastalWhale = new WhaleBrain( { terrain, seed: 1 } );
let maxCoastalY = - Infinity, highestSeabed = - Infinity, minBottomClearance = Infinity, maxCoastalBreachPitch = 0;
for ( let i = 0; i < 6000; i ++ ) {

	const inBreach = !! coastalWhale.seq?.keys[ coastalWhale.seq.i ]?.breach;
	coastalWhale.update( 0.1 );
	const floor = terrain.heightAt( coastalWhale.position.x, coastalWhale.position.z );
	maxCoastalY = Math.max( maxCoastalY, coastalWhale.y );
	highestSeabed = Math.max( highestSeabed, floor );
	minBottomClearance = Math.min( minBottomClearance, coastalWhale.y - floor );
	if ( inBreach ) maxCoastalBreachPitch = Math.max( maxCoastalBreachPitch, Math.abs( coastalWhale.pitch ) );

}

ok( highestSeabed < 0, `the coastal whale route stays over water (nearest seabed ${ highestSeabed.toFixed( 2 ) } m below sea level)` );
ok( maxCoastalY < 0, `seabed avoidance never lifts the whale above water (${ maxCoastalY.toFixed( 2 ) } m)` );
ok( minBottomClearance > 1.5, `the whale keeps clearance above the shallow seabed (${ minBottomClearance.toFixed( 2 ) } m)` );
ok( maxCoastalBreachPitch < 0.1, `coastal breaches keep the full body low (${ ( maxCoastalBreachPitch * 180 / Math.PI ).toFixed( 1 ) }°)` );
ok( coastalWhale.breaches > 0, 'the coastal route still produces a breach event' );

console.log( fails ? `${ fails } FAILED` : 'all passed' );
process.exit( fails ? 1 : 0 );
