// Offline-first, UTC-weekly harbor requests. A request is selected deterministically from
// the ISO week, so reopening the game or loading the same save cannot reroll its reward.
export const WEEKLY_BRIEFS = [
	{ id: 'pier-regular', title: 'Pier Regular', icon: '⚓', habitat: 'pier', water: 'the pier', target: 4, reward: 170 },
	{ id: 'sandbar-sweep', title: 'Sandbar Sweep', icon: '🌊', habitat: 'shallows', water: 'the shallows', target: 4, reward: 170 },
	{ id: 'reef-patrol', title: 'Reef Patrol', icon: '🪸', habitat: 'reef', water: 'the reef', target: 4, reward: 220 },
	{ id: 'open-water-run', title: 'Open Water Run', icon: '🛶', habitat: 'bay', water: 'the open bay', target: 4, reward: 200 },
	{ id: 'offshore-haul', title: 'Offshore Haul', icon: '🐟', habitat: 'deep', water: 'offshore', target: 3, reward: 280 },
	{ id: 'cay-flats', title: 'Cay Flats Survey', icon: '🏝️', habitat: 'cay', water: 'Pelican Cay', location: 'pelican-cay', target: 3, reward: 250 },
	{ id: 'key-waters', title: 'Key Waters Survey', icon: '🗺️', habitat: 'key', water: 'Turtle Key', location: 'turtle-key', target: 3, reward: 250 },
	{ id: 'mangrove-creek', title: 'Mangrove Creek Survey', icon: '🌿', habitat: 'mangrove', water: 'Mangrove Reach', location: 'mangrove-reach', target: 3, reward: 250 },
	{ id: 'sunspire-shelf', title: 'Outer Shelf Census', icon: '🌅', habitat: 'atoll', water: 'Sunspire Atoll', location: 'sunspire-atoll', target: 3, reward: 300 },
].map( ( brief ) => ( { ...brief, description: `Land ${ brief.target } fish around ${ brief.water }.` } ) );

const MS_PER_DAY = 86_400_000;

export function getUtcWeekId( date = new Date() ) {

	const thursday = new Date( Date.UTC( date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() ) );
	const weekday = ( thursday.getUTCDay() + 6 ) % 7;
	thursday.setUTCDate( thursday.getUTCDate() - weekday + 3 );
	const year = thursday.getUTCFullYear();
	const jan4 = new Date( Date.UTC( year, 0, 4 ) );
	const weekOneMonday = new Date( jan4 );
	weekOneMonday.setUTCDate( jan4.getUTCDate() - ( ( jan4.getUTCDay() + 6 ) % 7 ) );
	const week = 1 + Math.floor( ( thursday.getTime() - weekOneMonday.getTime() ) / ( 7 * MS_PER_DAY ) );
	return `${ year }-W${ String( week ).padStart( 2, '0' ) }`;

}

export function getWeeklyBriefSpec( weekId, discoveredLocations = [], availableHabitats = null ) {

	const match = /^(\d{4})-W(\d{2})$/.exec( weekId || '' );
	const weekNumber = match ? Number( match[ 1 ] ) * 53 + Number( match[ 2 ] ) : 0;
	const supportedHabitats = availableHabitats ? new Set( availableHabitats ) : null;
	const available = WEEKLY_BRIEFS.filter( ( brief ) => ( ! brief.location || discoveredLocations.includes( brief.location ) ) && ( ! supportedHabitats || supportedHabitats.has( brief.habitat ) ) );
	return available[ weekNumber % available.length ];

}

export function getNextUtcMonday( date = new Date() ) {

	const next = new Date( Date.UTC( date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() ) );
	const daysUntilMonday = ( 8 - next.getUTCDay() ) % 7 || 7;
	next.setUTCDate( next.getUTCDate() + daysUntilMonday );
	return next;

}
