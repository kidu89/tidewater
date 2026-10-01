import { FISH, FISH_IDS } from './FishTable.js';

// Offline-first milestones derived from the player's saved career.
// Progress is earned through play and never expires.
export const HABITAT_KEYS = [ 'shallows', 'reef', 'pier', 'bay', 'deep', 'cay', 'key', 'mangrove' ];

const uniqueSpecies = ( state ) => Object.entries( state.log ).filter( ( [ id, entry ] ) => FISH[ id ] && entry?.count > 0 ).length;
const watersExplored = ( state ) => HABITAT_KEYS.filter( ( key ) => state.career.habitats[ key ] > 0 ).length;
const upgradeLevels = ( state ) => Object.values( state.upgrades ).reduce( ( sum, level ) => sum + ( level | 0 ), 0 );

export const ACHIEVEMENTS = [
	{ id: 'first-catch', icon: '🎣', title: 'First Catch', description: 'Land your first fish.', target: 1, current: ( s ) => s.career.caught },
	{ id: 'first-sale', icon: '🪙', title: 'Market Day', description: 'Sell a fish to Joe.', target: 1, current: ( s ) => s.career.sold },
	{ id: 'ten-catches', icon: '🐟', title: 'Getting the Feel', description: 'Land 10 fish.', target: 10, current: ( s ) => s.career.caught },
	{ id: 'fifty-catches', icon: '🛶', title: 'Regular on the Water', description: 'Land 50 fish.', target: 50, current: ( s ) => s.career.caught },
	{ id: 'hundred-catches', icon: '🌊', title: 'One Hundred Casts', description: 'Land 100 fish.', target: 100, current: ( s ) => s.career.caught },
	{ id: 'first-upgrade', icon: '⚙️', title: 'A Better Setup', description: 'Buy your first gear upgrade.', target: 1, current: upgradeLevels },
	{ id: 'first-record', icon: '🏅', title: 'Personal Best', description: 'Beat a previous species record.', target: 1, current: ( s ) => s.career.records },
	{ id: 'five-species', icon: '🐠', title: 'Curious Collector', description: 'Discover five fish species.', target: 5, current: uniqueSpecies },
	{ id: 'ten-species', icon: '📖', title: 'Field Naturalist', description: 'Discover ten fish species.', target: 10, current: uniqueSpecies },
	{ id: 'all-species', icon: '🧭', title: 'Island Naturalist', description: 'Discover all ' + FISH_IDS.length + ' fish species.', target: FISH_IDS.length, current: uniqueSpecies },
	{ id: 'reef-regular', icon: '🪸', title: 'Reef Regular', description: 'Land three fish over the reef.', target: 3, current: ( s ) => s.career.habitats.reef },
	{ id: 'deep-water', icon: '⚓', title: 'Into the Blue', description: 'Land a fish in deep water.', target: 1, current: ( s ) => s.career.habitats.deep },
	{ id: 'cay-landfall', icon: '🏝️', title: 'Landfall at Pelican Cay', description: 'Reach Pelican Cay by boat.', target: 1, current: ( s ) => s.career.locations.includes( 'pelican-cay' ) ? 1 : 0 },
	{ id: 'cay-fisher', icon: '🐟', title: 'Flats Regular', description: 'Land three fish on Pelican Cay flats.', target: 3, current: ( s ) => s.career.habitats.cay },
	{ id: 'key-landfall', icon: '🗺️', title: 'A New Horizon', description: 'Reach Turtle Key by boat.', target: 1, current: ( s ) => s.career.locations.includes( 'turtle-key' ) ? 1 : 0 },
	{ id: 'key-fisher', icon: '🐟', title: 'Key Waters Regular', description: 'Land three fish in Turtle Key waters.', target: 3, current: ( s ) => s.career.habitats.key },
	{ id: 'mangrove-landfall', icon: '🌿', title: 'Into the Green', description: 'Reach Mangrove Reach by boat.', target: 1, current: ( s ) => s.career.locations.includes( 'mangrove-reach' ) ? 1 : 0 },
	{ id: 'mangrove-fisher', icon: '🐟', title: 'Tidal Creek Regular', description: 'Land three fish in Mangrove Reach waters.', target: 3, current: ( s ) => s.career.habitats.mangrove },
	{ id: 'three-waters', icon: '🌅', title: 'Island Explorer', description: 'Catch fish in three different waters.', target: 3, current: watersExplored },
	{ id: 'ten-kilo', icon: '💪', title: 'Trophy Fish', description: 'Land a fish weighing at least 10 kg.', target: 10, current: ( s ) => s.career.bestCatchKg, format: ( n ) => Math.min( n, 10 ).toFixed( 1 ) + ' / 10 kg' },
	{ id: 'twenty-five-kilo', icon: '🐋', title: 'Big Game', description: 'Land a fish weighing at least 25 kg.', target: 25, current: ( s ) => s.career.bestCatchKg, format: ( n ) => Math.min( n, 25 ).toFixed( 1 ) + ' / 25 kg' },
	{ id: 'thousand-earned', icon: '💰', title: 'Good Business', description: 'Earn $1,000 from fish sales.', target: 1000, current: ( s ) => s.career.salesValue, format: ( n ) => '$' + Math.min( n, 1000 ).toLocaleString() + ' / $1,000' },
];

export function getAchievementProgress( state ) {

	return ACHIEVEMENTS.map( ( achievement ) => {

		const current = Math.max( 0, achievement.current( state ) || 0 );
		return {
			...achievement,
			current,
			progress: Math.min( 1, current / achievement.target ),
			unlocked: current >= achievement.target,
			progressText: achievement.format ? achievement.format( current ) : String( Math.min( current, achievement.target ) ) + ' / ' + achievement.target,
		};

	} );

}
