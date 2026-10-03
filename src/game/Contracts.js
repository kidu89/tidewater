// Permanent, offline-first fishing contracts. Progress comes from the saved career;
// rewards are claimed once and never expire.
export const CONTRACTS = [
	{
		id: 'joes-first-order', icon: '🪙', title: 'Joe’s First Order',
		description: 'Sell three fish to Joe at the pier.', target: 3, reward: 150,
		current: ( state ) => state.career.sold,
		format: ( n ) => `${ Math.min( n, 3 ) } / 3 fish sold`,
	},
	{
		id: 'pelican-landfall', icon: '🏝️', title: 'Island Survey',
		description: 'Take the boat out and discover Pelican Cay.', target: 1, reward: 180,
		current: ( state ) => state.career.locations.includes( 'pelican-cay' ) ? 1 : 0,
		format: ( n ) => n ? 'Island discovered' : 'Follow the gold star on the map',
	},
	{
		id: 'cay-flats-survey', icon: '🌊', title: 'Flats Survey',
		description: 'Land five fish over Pelican Cay’s shallow flats.', target: 5, reward: 240,
		current: ( state ) => state.career.habitats.cay,
		format: ( n ) => `${ Math.min( n, 5 ) } / 5 fish landed`,
	},
	{
		id: 'bonefish-specimen', icon: '🐟', title: 'Bonefish Specimen',
		description: 'Add the elusive bonefish to your catch log at Pelican Cay.', target: 1, reward: 300,
		current: ( state ) => state.log.bonefish?.count || 0,
		format: ( n ) => n ? 'Bonefish recorded' : 'Fish the Cay flats and check your line',
	},
	{
		id: 'turtle-key-landfall', icon: '🗺️', title: 'Turtle Key Expedition',
		description: 'Take the boat east and discover Turtle Key.', target: 1, reward: 220,
		current: ( state ) => state.career.locations.includes( 'turtle-key' ) ? 1 : 0,
		format: ( n ) => n ? 'Turtle Key discovered' : 'Follow the teal marker east of Pelican Cay',
	},
	{
		id: 'key-waters-survey', icon: '🌊', title: 'Blue Water Survey',
		description: 'Land three fish around Turtle Key.', target: 3, reward: 180,
		current: ( state ) => state.career.habitats.key,
		format: ( n ) => `${ Math.min( n, 3 ) } / 3 fish landed`,
	},
	{
		id: 'snook-specimen', icon: '🐟', title: 'Silver Shadow',
		description: 'Add a common snook to your catch log.', target: 1, reward: 220,
		current: ( state ) => state.log.snook?.count || 0,
		format: ( n ) => n ? 'Snook recorded' : 'Fish the sheltered water around Turtle Key',
	},
	{
		id: 'lionfish-specimen', icon: '🪸', title: 'Reef Guardian',
		description: 'Record a lionfish from the coral reef.', target: 1, reward: 220,
		current: ( state ) => state.log.lionfish?.count || 0,
		format: ( n ) => n ? 'Lionfish recorded' : 'Try a slow cast along the reef at night',
	},
	{
		id: 'wahoo-run', icon: '💨', title: 'Blue Streak',
		description: 'Land a wahoo from the offshore drop-off.', target: 1, reward: 360,
		current: ( state ) => state.log.wahoo?.count || 0,
		format: ( n ) => n ? 'Wahoo recorded' : 'Try the deep drop-off at dawn or dusk',
	},
	{
		id: 'mangrove-reach-survey', icon: '🌿', title: 'Tidal Forest Survey',
		description: 'Navigate southwest and discover Mangrove Reach.', target: 1, reward: 260,
		current: ( state ) => state.career.locations.includes( 'mangrove-reach' ) ? 1 : 0,
		format: ( n ) => n ? 'Mangrove Reach charted' : 'Follow the green marker southwest of the harbor',
	},
	{
		id: 'mangrove-creek-catch', icon: '🎣', title: 'Creek Keeper',
		description: 'Land five fish in the sheltered mangrove creeks.', target: 5, reward: 240,
		current: ( state ) => state.career.habitats.mangrove,
		format: ( n ) => `${ Math.min( n, 5 ) } / 5 fish landed`,
	},
	{
		id: 'sunspire-atoll-landfall', icon: '🌅', title: 'Outer Reef Expedition',
		description: 'Navigate southeast and chart Sunspire Atoll.', target: 1, reward: 320,
		current: ( state ) => state.career.locations.includes( 'sunspire-atoll' ) ? 1 : 0,
		format: ( n ) => n ? 'Sunspire Atoll charted' : 'Follow the amber marker southeast from the harbor',
	},
	{
		id: 'black-grouper-specimen', icon: '🐟', title: 'Shadow on the Shelf',
		description: 'Land and record a black grouper from the outer atoll reef.', target: 1, reward: 420,
		current: ( state ) => state.log.blackGrouper?.count || 0,
		format: ( n ) => n ? 'Black grouper recorded' : 'Fish the rocky outer shelf at dawn or dusk',
	},
	{
		id: 'sunspire-shelf-catch', icon: '🪨', title: 'Shelf Survey',
		description: 'Land five fish in Sunspire Atoll waters.', target: 5, reward: 280,
		current: ( state ) => state.career.habitats.atoll,
		format: ( n ) => `${ Math.min( n, 5 ) } / 5 fish landed`,
	},
];

export const CONTRACT_IDS = new Set( CONTRACTS.map( ( contract ) => contract.id ) );

export function getContractProgress( state ) {

	const claimed = new Set( state.career.claimedContracts );
	return CONTRACTS.map( ( contract ) => {

		const current = Math.max( 0, contract.current( state ) || 0 );
		return {
			...contract,
			current,
			progress: Math.min( 1, current / contract.target ),
			complete: current >= contract.target,
			claimed: claimed.has( contract.id ),
			progressText: contract.format( current ),
		};

	} );

}
