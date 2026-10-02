# Fishing Free — Steam store page draft

**Status:** Internal copy draft, 2 October 2026. This is not a live Steam page. The name, price, store art and final Windows build still need release approval.

## Store identity

- **Working title:** Fishing Free
- **One-line pitch:** A quiet first-person fishing trip through a tropical island and its surrounding waters.
- **Platform for this listing:** Windows 10/11, x64
- **Player mode:** Single-player
- **Interface language:** English
- **Save:** Local save; Steam Cloud is not integrated
- **Controller:** Gamepad input exists in the game, but the finished Windows package has not been checked with a physical controller or Steam Deck. Do not advertise controller support until that pass is complete.
- **Achievements:** The game has an in-game journal and achievement panel. Steam achievements are not integrated.
- **Online features:** None in the Windows release candidate. Do not mark multiplayer, co-op, PvP, or cross-platform play.

## Short description

Cast from a tropical pier, steer out to reef and island waters, and fill your field guide one catch at a time in a quiet first-person fishing adventure.

## About this game

Leave the harbor and explore the warm waters around a small island. Cast from the beach or pier, fish over the reef, or take your boat to Pelican Cay, Turtle Key and Mangrove Reach. The sky and water shift through the day, and different fish favor different places and hours.

Read the bite, manage line tension through the fight, then bring your catch back to Joe. Earn in-game money, improve your rod and boat, and take on lasting harbor contracts that lead you toward new waters. Add 23 tropical species to your field guide, set personal records and keep exploring at your own pace.

Fishing Free is a solo fishing and island exploration game built around short trips and an unhurried pace. Walk the shore, take the helm, find a new spot, or settle in for one more cast.

### Features

- Explore the harbor and three chartable destinations: Pelican Cay, Turtle Key and Mangrove Reach.
- Fish eight habitat types, from beach shallows and the pier to reef, mangrove creeks and offshore water.
- Catch 23 tropical species whose preferred habitats, active hours, sizes and fighting strength differ.
- Play through a timing-and-line-tension catch fight, then record species, sizes and personal bests.
- Sell fish, complete permanent contracts and spend earned in-game money on fishing and boat upgrades.
- Walk the island or pilot the boat; recover from a capsize or stranding with the harbor tow.

## Store tags to review in Steamworks

Suggested starting order, subject to checking Steam's current tag picker and the final build: **Fishing**, **Relaxing**, **Singleplayer**, **Exploration**, **Nature**, **Simulation**, **Atmospheric**, **Casual**, **First-Person**, **Open World**, **3D**, **Adventure**.

Do not add Multiplayer, Online Co-op, PvP, Steam Cloud, Steam Achievements, Steam Deck Verified or language support that has not been implemented and checked. "Fishing Free" is the requested working brand, but the word “Free” may lead Steam users to expect a free-to-play product; check title availability and store search results before the title is submitted.

## Media plan

### Screenshots

The existing `docs/screenshot.jpg` and `docs/screenshot-beach.jpg` show in-game 3D scenes at 1920×950. Keep them as capture references. Before store submission, capture at least six clean screenshots from the exact Windows release candidate, at the shipping display resolution:

1. First-person cast from the pier, rod and open water visible.
2. A landed fish and the in-game catch card or field guide.
3. Boat underway with the island visible ahead.
4. Pelican Cay flats or reef fishing.
5. Mangrove Reach or Turtle Key, with a different habitat composition.
6. A fish fight, harbor return or gear-upgrade interaction that shows a real game system.

Capture the actual game, with no marketing text or edited-in features. Confirm every image represents the build being sold. Replace any shot that exposes a bug, placeholder, debug overlay or broken physics state.

### Capsules and library art

Internal art drafts now exist in `docs/steam-assets-draft-v2/`: main 1232×706, header 920×430, small capsule 462×174, vertical store capsule 748×896, library capsule 600×900, and library hero 3840×1240. Run `scripts/build-steam-capsules.ps1` and `scripts/build-steam-artwork.ps1` from the repository root to create them. The AI-generated source concept was guided by the in-game beach capture, but is not game footage. The hero export is an upscaled 1672×940 concept crop and is not final-resolution art. None of these assets has been approved for the live store. Clear the working name and get owner approval before Steam submission. Store capsules may show the game's artwork, name and official subtitle only. The library hero is artwork only. Do not put discounts, review scores, extra feature claims or calls to action on base capsules.

The two in-repo gameplay reference captures are 1920×950 (not 16:9) and are therefore not Steam-ready screenshots. Valve requires at least five gameplay screenshots, each at least 1920×1080 and 16:9. Capture six current, clean screenshots from the final Windows build; do not crop or pad the existing references to imply they came from a 16:9 shipping build.

The existing `public/ui/keyart.jpg` (2560×1440) is an in-game scene capture introduced by upstream commit `1438b1a`, which also added the root MIT license. It is not a third-party photograph. It remains game-loading art, not a final Steam capsule; use screenshots captured from the approved shipping build for store media, and preserve the root MIT notice plus separate third-party asset credits.

### Trailer

Record a 45–60 second trailer from the final Windows build: harbor and changing light; walk to the pier; cast and play the fish fight; show the catch record; take the boat to a second habitat; end on an unbranded landscape shot plus the cleared title. Use only footage and features present in the shipping build. There is no trailer file in the repository yet.

## Release decisions still open

- Clear the working title and document the rights to all capsule and trailer assets.
- Choose the commercial model and enter final Steam pricing. The product audit proposes a bounded free demo with a one-time paid full game; USD 4.99–7.99 is a test hypothesis, not an approved price. Consider a higher price only if playtests demonstrate enough content and replay value.
- Decide whether a demo is worth maintaining. If offered, give it a satisfying, clearly bounded fishing loop and test the save handoff before publishing.
- Confirm minimum Windows version and GPU requirements using a clean install. The current 3D renderer needs a usable WebGPU adapter; do not claim universal GPU compatibility.
- Test first launch, shader compilation time, save persistence, display scaling, window controls, sleep/resume, the Steam overlay and controller input on a clean Windows 10/11 machine.
- The latest Windows candidate is version 1.0.15 from commit `bd3887e`, packaged and startup-smoke-tested by [GitHub Actions run 37053852529](https://github.com/kidu89/tidewater/actions/runs/37053852529). Create a fresh Windows build from the final approved release commit before SteamPipe; this candidate still needs clean retail-PC and Steam-client verification.
- Complete Steamworks partner onboarding, Steam Direct, the app and Windows depot setup, store/build review, SteamPipe upload, Coming Soon period and owner-triggered release.

## Valve references

- [Store Page, Building and Editing](https://partner.steamgames.com/doc/store/page)
- [Graphical Assets — Overview](https://partner.steamgames.com/doc/store/assets)
- [Graphical Asset Rules](https://partner.steamgames.com/doc/store/assets/rules)
- [Release Process](https://partner.steamgames.com/doc/store/releasing?l=english)
- [Review Process](https://partner.steamgames.com/doc/store/review_process?language=english)
