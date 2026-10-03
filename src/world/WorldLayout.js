import * as THREE from '../engine/index.js';

// Shared world layout. Coordinates in meters, y up, sea level y = 0.
// The open ocean lies to the south (+z); the island to the north (-z).
// Sun rises in the east (+x) and sets in the west (-x).
export const WORLD = {
	terrainSize: 2048, // heightmap domain, centered at origin
	terrainRes: 2048,

	// Central sandy beach inside the bay, shoreline near z ≈ -42 at x = 0.
	beach: { xMin: - 150, xMax: 170 },

	pier: {
		x: 55,
		zStart: - 64, // on dry sand
		zEnd: 40, // end of pier (~4 m depth)
		deckHeight: 2.3, // deck surface above sea level
		width: 2.6,
		headWidth: 14, // T-shaped platform at the end
		headDepth: 7,
	},

	// Where the boat is moored: east side of the pier head, bow pointing south.
	boatDock: { position: new THREE.Vector3( 64.5, 0, 36.5 ), heading: 0 },

	village: { center: new THREE.Vector3( 40, 0, - 118 ), radius: 95 },

	reef: { center: new THREE.Vector3( - 78, 0, 58 ), radius: 58 },

	pelicanCay: {
		name: 'Pelican Cay',
		center: new THREE.Vector3( 0, 0, 245 ),
		radiusX: 62,
		radiusZ: 48,
		fishingRadius: 138,
		discoverRadius: 95,
	},

	turtleKey: {
		name: 'Turtle Key',
		center: new THREE.Vector3( 248, 0, 276 ),
		radiusX: 46,
		radiusZ: 34,
		fishingRadius: 116,
		discoverRadius: 82,
	},

	mangroveReach: {
		name: 'Mangrove Reach',
		center: new THREE.Vector3( - 410, 0, 520 ),
		radiusX: 52,
		radiusZ: 38,
		islets: [
			{ center: new THREE.Vector3( - 488, 0, 495 ), radiusX: 21, radiusZ: 26 },
			{ center: new THREE.Vector3( - 326, 0, 558 ), radiusX: 24, radiusZ: 18 },
		],
		fishingRadius: 150,
		discoverRadius: 100,
	},

	sunspireAtoll: {
		name: 'Sunspire Atoll',
		center: new THREE.Vector3( 470, 0, 620 ),
		radiusX: 58,
		radiusZ: 42,
		islets: [
			{ center: new THREE.Vector3( 548, 0, 594 ), radiusX: 22, radiusZ: 17 },
			{ center: new THREE.Vector3( 418, 0, 676 ), radiusX: 24, radiusZ: 18 },
		],
		fishingRadius: 340,
		discoverRadius: 112,
	},

	spawn: { position: new THREE.Vector3( 18, 0, - 60 ), yaw: Math.PI }, // kept clear of rocks, plants and debris
	// where the player starts: on the boardwalk up from the pier foot, looking down it toward the pier
	start: { position: new THREE.Vector3( 53.6, 0, - 77 ), yaw: Math.PI },

	// Incoming swell direction (unit, travel direction)
	swellDir: new THREE.Vector2( - 0.12, - 1 ).normalize(),
};
