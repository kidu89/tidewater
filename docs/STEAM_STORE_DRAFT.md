# Fishing Free — Steam store page draft

**Status:** Internal copy draft, 4 October 2026. Current Windows candidate: Fishing Free 1.0.32. This is not a live Steam page; title clearance, Steamworks onboarding, final store art, owner approval and release approval remain open.

## Current 1.0.32 Windows screenshot review

The 1.0.32 candidate was launched from the packaged Windows executable in release/win-unpacked/Fishing Free.exe (245,780,992 bytes; SHA-256 A8CFBA8FCBFF09CBFCE17DF8714A9832BAC553F9F003C27DD4F1E745943BE444). Captures were made directly from that running production package at 1920×1080. Movement, fishing, catches, boat boarding, helm use and travel were performed with ordinary in-game controls. No screenshot was edited, cropped, composited or annotated.

The locally retained, Git-ignored review frames are under release/1.0.32-windows-candidate/:

- steam-1.0.32-gameplay-clean.png — clean harbor gameplay and normal HUD.
- store-10-pier-walk-clean.png — first-person walk down the pier toward the boat and islands.
- store-04-pier-fishing.png — rod, cast line and water.
- store-05-bobber-watch.png — a naturally triggered bite and strike prompt.
- store-07-catch-record.png — actual caught striped mullet and catch record.
- store-08-fish-logbook.png — in-game logbook after the catch.
- store-13-helm.png — boat at the harbor, shown from the normal third-person helm camera.
- store-14-boat-underway.png — boat moving offshore with wake and island scenery.

All eight listed files were checked as 1920×1080 PNGs. These are an internal review set; the owner has not approved them for publication. Steam’s current graphical asset guidance calls for at least five screenshots at 1920×1080 and 16:9: [Steam graphical asset requirements](https://partner.steamgames.com/doc/store/assets?language=english).

Do not use the discarded internal frames: store-02-cast-at-harbor.png lands on sand; store-06-fish-fight.png exposes a slack-line state; store-09-boat-approach.png and store-09b-pier-steps.png show obstructed under-dock views; store-15-pelican-cay-approach.png shows the boat grounded against rocks. The game’s harbor-tow recovery returned the boat to the pier and retained the Pelican Cay discovery. The destination capture still needs a safe, clean pass before it can be considered for the store.

A 1.0.32 screenshot index with capture conditions and review notes is in docs/steam-capture-review-1.0.32.md. Store media must continue to match the approved shipping build; the screenshots here are not uploaded to Steam and do not constitute owner approval.

## Store identity

- **Working title:** Fishing Free
- **One-line pitch:** A quiet first-person fishing trip through a tropical island and its surrounding waters.
- **Platform for this listing:** Windows 10/11, x64
- **Player mode:** Single-player
- **Interface language:** English
- **Save:** Local save; Steam Cloud is not integrated
- **Controller:** Gamepad input exists in the game, but the finished Windows package has not been checked with a physical controller or Steam Deck. Do not advertise controller support until that pass is complete.
- **Achievements:** The game has an in-game journal and achievement panel. Steam achievements are not integrated.
- **Commercial model:** Free base game. No paid content is available now; any future paid expansion must add a new region and remain optional.
- **Online features:** None in the Windows release candidate. Do not mark multiplayer, co-op, PvP, or cross-platform play.

## Short description

Cast from a tropical pier, steer out to reef and island waters, and fill your field guide one catch at a time in a quiet first-person fishing adventure.

## About this game

Leave the harbor and explore the warm waters around a small island. Cast from the beach or pier, fish over the reef, or take your boat to Pelican Cay, Turtle Key, Mangrove Reach and Sunspire Atoll. The sky and water shift through the day, and different fish favor different places and hours.

Read the bite, manage line tension through the fight, then bring your catch back to Joe. Earn in-game money, improve your rod and boat, and take on lasting harbor contracts that lead you toward new waters. Add 24 tropical species to your field guide, set personal records and keep exploring at your own pace.

Fishing Free is a solo fishing and island exploration game built around short trips and an unhurried pace. Walk the shore, take the helm, find a new spot, or settle in for one more cast.

### Features

- Explore the harbor and four chartable destinations: Pelican Cay, Turtle Key, Mangrove Reach and Sunspire Atoll.
- Fish nine habitat types, from beach shallows and the pier to reef, mangrove creeks and offshore water.
- Catch 24 tropical species whose preferred habitats, active hours, sizes and fighting strength differ.
- Play through a timing-and-line-tension catch fight, then record species, sizes and personal bests.
- Sell fish, complete permanent contracts and spend earned in-game money on fishing and boat upgrades.
- Walk the island or pilot the boat; recover from a capsize or stranding with the harbor tow.

## Store tags to review in Steamworks

Suggested starting order, subject to checking Steam's current tag picker and the final build: **Fishing**, **Relaxing**, **Singleplayer**, **Exploration**, **Nature**, **Simulation**, **Atmospheric**, **Casual**, **First-Person**, **Open World**, **3D**, **Adventure**.

Do not add Multiplayer, Online Co-op, PvP, Steam Cloud, Steam Achievements, Steam Deck Verified or language support that has not been implemented and checked. "Fishing Free" is the requested working brand, but the title intentionally signals a free base game; clear title availability, store search results, domain and trademark before submission.

## Media plan

### Screenshots

The existing beach captures are useful scene references. The 1.0.32 packaged build now has eight local 1920×1080 review screenshots listed above; owner approval is still pending. Suggested coverage for the final submitted set:

Historical 1.0.30 review: the 18 images were captured from the production bundle rather than the packaged executable and are not current store evidence. Use the eight exact-package 1.0.32 frames listed near the top of this draft for owner review. Steam graphical asset requirements: [Valve documentation](https://partner.steamgames.com/doc/store/assets?language=english).

1. First-person cast from the pier, rod and open water visible.
2. A landed fish and the in-game catch card or field guide.
3. Boat underway with the island visible ahead.
4. Pelican Cay flats or reef fishing.
5. Mangrove Reach or Turtle Key, with a different habitat composition.
6. A fish fight, harbor return or gear-upgrade interaction that shows a real game system.

Capture the actual game, with no marketing text or edited-in features. Confirm every image represents the build being sold. Replace any shot that exposes a bug, placeholder, debug overlay or broken physics state.

### Capsules and library art

Internal art drafts now exist in `docs/steam-assets-draft-v2/`: main 1232×706, header 920×430, small capsule 462×174, vertical store capsule 748×896, library capsule 600×900, and library hero 3840×1240. Run `scripts/build-steam-capsules.ps1` and `scripts/build-steam-artwork.ps1` from the repository root to create them. The AI-generated source concept was guided by the in-game beach capture, but is not game footage. The hero export is an upscaled 1672×940 concept crop and is not final-resolution art. None of these assets has been approved for the live store. Clear the working name and get owner approval before Steam submission. Store capsules may show the game's artwork, name and official subtitle only. The library hero is artwork only. Do not put discounts, review scores, extra feature claims or calls to action on base capsules.

Historical 1.0.31 review: the empty journal/cooler layout was visually checked in its packaged executable. Its screenshot set has been superseded by the exact-package 1.0.32 review set near the top of this draft.

The packaged Windows 1.0.23 artifact was launched locally in an isolated profile and reached the active 3D walking scene. Ten unedited 1920×1080 review captures are in `release/1.0.23-actions-4c851f9/store-captures-review/`; two are ordinary harbor walking views with nearly the same composition, while eight use the in-game Free Camera. These images are local, Git-ignored and unapproved review evidence, not a store-ready set; they are not uploaded to GitHub. The two raw 1.0.21 captures remain historical references. Steam requires screenshots of the product at a minimum of 1920×1080 and 16:9; target six distinct gameplay frames from the final Windows build, including the six moments listed above. Do not crop or pad images to imply they came from a 16:9 build.

The existing `public/ui/keyart.jpg` (2560×1440) is an in-game scene capture introduced by upstream commit `1438b1a`, which also added the root MIT license. It is not a third-party photograph. It remains game-loading art, not a final Steam capsule; use screenshots captured from the approved shipping build for store media, and preserve the root MIT notice plus separate third-party asset credits.

### Trailer

Record a 45–60 second trailer from the final Windows build: harbor and changing light; walk to the pier; cast and play the fish fight; show the catch record; take the boat to a second habitat; end on an unbranded landscape shot plus the cleared title. Use only footage and features present in the shipping build. There is no trailer file in the repository yet.

## Release decisions still open

- Keep **Fishing Free** as the requested working title, but do not treat it as cleared: a preliminary Steam search is not trademark/title clearance, and the descriptive phrase may be difficult to distinguish in store search. Confirm rights to all capsule and trailer assets.
- Choose the commercial model and enter final Steam pricing. Keep the base game free to match Fishing Free. Monetise only an optional, substantial new-region expansion after playtests validate demand; tentative tests are US$2.99–4.99 for one complete region or US$4.99–7.99 for a multi-region expansion, not approved prices. Do not charge for existing waters or add ads/cash-shop spending. Mobile stores require their own billing and entitlement implementation before selling the expansion there.
- Decide whether a demo is worth maintaining. If offered, give it a satisfying, clearly bounded fishing loop and test the save handoff before publishing.
- Confirm minimum Windows version and GPU requirements using a clean install. The current 3D renderer needs a usable WebGPU adapter; do not claim universal GPU compatibility.
- Test first launch, shader compilation time, save persistence, display scaling, window controls, sleep/resume, the Steam overlay and controller input on a clean Windows 10/11 machine.
- Windows 1.0.32 candidate: locally packaged in release/win-unpacked/ (752 files; 450,759,879 bytes; executable version 1.0.32.0; SHA-256 A8CFBA8FCBFF09CBFCE17DF8714A9832BAC553F9F003C27DD4F1E745943BE444). The production build was opened in an isolated profile with WebGPU; title screen, 3D gameplay, controls, photo mode, fishing, a natural catch, journal, pier walk, boat boarding, helm and underway movement were visually checked. The unsigned package has not been installed through Steam or a clean retail PC. Eight exact-package screenshots are locally available for owner review; destination fishing still needs a clean capture. Steamworks IDs, controller/overlay checks and SteamPipe upload remain outstanding. Windows Actions [run #30](https://github.com/kidu89/tidewater/actions/runs/37188543312) passed and uploaded the 1.0.32 ZIP artifact (214,626,920 bytes; digest sha256:7b7689a313689ad13bbc97ee0f30c38b13f520347581bad7c7ba158541965964).
- Complete Steamworks partner onboarding, Steam Direct, the app and Windows depot setup, store/build review, SteamPipe upload, Coming Soon period and owner-triggered release.
- Steam Direct is currently US$100 per app credit, recoupable after at least US$1,000 adjusted gross revenue; first releases also have a 30-day wait after fee payment and need a publicly visible Coming Soon page for at least two weeks. Valve says store-page and build reviews typically take 3–5 business days and recommends submitting at least 7 business days before a planned go-live. Recheck the fee, timing, and review state in Steamworks before setting a release date. [Steam Direct](https://partner.steamgames.com/steamdirect/), [review process](https://partner.steamgames.com/doc/store/review_process?l=english), [release process](https://partner.steamgames.com/doc/store/releasing?l=english).

## Valve references

- [Store Page, Building and Editing](https://partner.steamgames.com/doc/store/page)
- [Graphical Assets — Overview](https://partner.steamgames.com/doc/store/assets)
- [Graphical Asset Rules](https://partner.steamgames.com/doc/store/assets/rules)
- [Release Process](https://partner.steamgames.com/doc/store/releasing?l=english)
- [Review Process](https://partner.steamgames.com/doc/store/review_process?language=english)
