# Fishing Free — product, market and monetization audit

**Audit date:** 4 October 2026
**Research baseline:** Fishing Free 1.0.26. The current 1.0.27 patch changes Android startup timing and release metadata; fish, maps, progression, and commercial hypotheses are unchanged.
**Purpose:** current product decision, market framing, monetization recommendation and release plan. Historical build details are kept in [docs/release status](docs/RELEASE_STATUS_2026-10-04.md).

## Latest verified state — 4 October 2026

The current local candidate is Fishing Free 1.0.27. Android 12+ still attempts the original WebGPU 3D renderer; an unresponsive adapter search now has a 4.5-second cap before the bundled Scenic Fishing fallback opens. Android 10/11 continue to open Scenic Fishing directly. That fallback uses high-resolution scenes and touch fishing, not real-time 3D.

- **Ownership and product name:** the user-owned public repository is `kidu89/tidewater`, and product-facing metadata says Fishing Free. Retain the upstream MIT copyright/license and third-party asset credits; rebranding does not transfer authorship or remove license obligations.
- **Web/PWA:** Pages deployed version 1.0.27 from commit `498f7a3` in [run 37166225321](https://github.com/kidu89/tidewater/actions/runs/37166225321). No physical-phone browser check has passed.
- **Android:** local 1.0.27 APK `release/1.0.27-android-local/Fishing-Free-1.0.27-Android.apk`, 57,732,097 bytes, SHA-256 `E88C201EC456838847B25A96DEB038939142F0BECAF2A86D6C20CEE5F5F42B33`. Downloaded Actions APK `release/1.0.27-android-actions/Fishing-Free-1.0.27-Android.apk`, 57,731,953 bytes, SHA-256 `17625E01DA5CBC71161C81B198B4AD70802807BD2D03581A2FC2134E4074383A`. Package `com.fishingfree.game`, version 1.0.27/code 27, min API 24, target API 36. Local and CI v2 signatures and 4-byte alignment verified; CI run [37166245631](https://github.com/kidu89/tidewater/actions/runs/37166245631) uploaded the APK successfully. The 1.0.27 APK has not been installed on a device; 1.0.26 emulator evidence is from a separate `.validation` package. No physical Samsung A52 or Huawei test has passed.
- **Windows:** local 1.0.27 x64 package built in `release/win-unpacked` (752 files, 450,745,028 bytes; executable reports 1.0.27.0). It is unsigned. Windows Actions [run 37166245511](https://github.com/kidu89/tidewater/actions/runs/37166245511) built the package and passed the staged startup/loopback check. Clean PC/WebGPU startup, save persistence, controller and Steam overlay remain unverified for 1.0.27.
- **Steam:** there is no supplied Steamworks App ID/depot ID, approved store page, SteamPipe upload, review or live branch. Final title clearance and owner-approved media are not complete.
- **iOS:** both Xcode App configurations now use version 1.0.27/build 27, bundle `com.fishingfree.game`, target iOS 15. No signed installable IPA exists because the owner has a personal Apple ID but no Apple Developer membership or signing assets. Safari PWA remains the iPhone route.
- **Commercial evidence:** no representative retention, wishlist, conversion, sales or willingness-to-pay data exists. There is no billing, ads, purchase entitlement or real-money currency.
## Executive decision

**Continue controlled testing; do not announce a Steam date or buy user-acquisition ads yet.** The product has a strong visual premise and a multi-trip solo progression loop. The first-session experience and store distribution are not sufficiently verified, and there is no evidence yet that players return or would pay.

Keep the first product free and single-player. Preserve all current waters and progression for free. Finish real-device startup, Windows/Steam verification and store media first; then test whether players complete a trip and return. Consider charging only for a substantial optional region after that evidence exists.

## What is in the product now

Source-table counts are unchanged from 1.0.26 in the 1.0.27 patch: **24 catchable fish**, **14 permanent career contracts**, **24 in-game achievements**, nine habitats, five destinations counting the home island, and a weekly harbor brief chosen deterministically from nine brief types.

- Browser-first custom WebGPU/WGSL fishing and island exploration: cast, hook, manage line tension, land a fish, keep or sell it, then upgrade gear/boat.
- Fish log and size/weight records, local save data, photo mode, catch-card sharing and offline-first solo progression.
- A Capacitor Android/iOS wrapper. Mobile fallback is Scenic Fishing with real in-game high-resolution scenery and touch fishing; it is not realtime 3D parity.
- Optional friend challenges accept client-reported scores. They are suitable for casual sharing, not ranked competition, prizes or paid play.
- Electron/Chromium Windows x64 package path. There is no Steam Cloud or cross-device save service.

## Product strengths and market fit

### Internal readiness scores

These are judgement calls for prioritizing work, not market-size data. Scale: 0 = absent; 1 = weak or unverified; 3 = promising but unvalidated; 5 = demonstrated with representative players.

| Dimension | Score | Evidence |
|---|---:|---|
| Visual/product premise | 3/5 | Tropical island, ocean and whale are legible and distinctive. |
| Solo progression | 3/5 | Collection, destinations, permanent contracts, weekly briefs and upgrades form a multi-trip loop. |
| First-session reliability | 1/5 | WebGPU cold start and physical Android experience remain unverified. |
| Distribution readiness | 1/5 | Web and CI candidates exist; no Steam upload, Play release or signed iOS build. |
| Sharing and return | 2/5 | Catch cards, friend challenges and weekly briefs exist; results have not been measured. |
| Commercial validation | 0/5 | No representative cohort, wishlists, sales, conversion or price test. |

**Assessment:** the premise merits controlled playtesting; commercial viability remains unproven. The main risk is whether first play starts quickly and reliably, then whether the loop earns a second session. More content alone will not answer that question.
### Strengths worth protecting

1. **Recognizable scenery:** tropical island, ocean and whale are more ownable than a list of generic fishing mechanics. Store art and trailer need to show the real shipped game.
2. **Relaxation with a skill moment:** calm exploration switches into the tension-management fight. This gives clips and catch cards an understandable payoff.
3. **Useful solo scaffolding:** the maps, contracts, collection and equipment already give a reason to make several trips. Nothing requires an online account.
4. **One codebase for the first test:** the new Windows shell and Capacitor shell package the same web build, lowering iteration cost while the product is small.

### Market and positioning risks

- The fishing category is established and crowded. [Fishing Planet](https://store.steampowered.com/app/380600/Fishing_Planet/) is a large free-to-play simulator; [DREDGE](https://store.steampowered.com/app/1562430/DREDGE/) is a premium, authored fishing adventure. These set different expectations and are not direct scope targets. Fishing Free should lead with quiet tropical exploration, real-time scenery and its solo catch loop rather than claim to beat either on scale or realism.
- “Fishing Free” is descriptive and hard to distinguish in search, but “Free” also creates a clear price expectation. Keep the base game free on Steam and mobile; consider monetising only a substantial, optional new-region expansion after retention and interest are measured. Do not charge for current locations, add ads, sell power or introduce a cash shop. Clear title availability, domain and trademark before store submission.
- A premium-looking renderer raises expectations for camera feel, framerate, content density and controller support. Standard-mapped gamepad controls are implemented for play and basic menus, but they have not been checked on a physical controller or Steam Deck. Do not list verified controller or Steam Deck support until those checks pass.
- A screenshot of `chrome://gpu` showing WebGPU hardware acceleration only describes that Chrome build/device. It does not prove a Capacitor WebView can create the adapter the game needs. Android 10, Android 12, browser Chrome and Android System WebView must be recorded separately.
- The first full 3D launch compiles many shaders. If the first playable cast takes too long, mobile ratings, Steam reviews and sharing will suffer. Measure cold starts after reinstall and after cache warm-up.

### Recommended positioning

> A quiet tropical fishing trip: take the boat beyond the reef, learn where island fish bite, and bring home a catch worth remembering.

Primary audience: people who want a scenic, low-pressure solo fishing/exploration game, plus anglers who enjoy collecting species and improving a small boat. Avoid broad claims such as “realistic simulator,” “multiplayer,” “controller support,” “works on every phone,” or “cross-platform saves” until those features are true in the release build.

### Comparable Steam products checked 4 October 2026

These official product pages show adjacent products and visible positioning. Their prices and review counts do not predict Fishing Free sales, budget or demand.

| Game | Visible signal when checked | Relevant comparison | Difference |
|---|---|---|---|
| [Cat Goes Fishing](https://store.steampowered.com/app/343780/Cat_Goes_Fishing/) | US$6.99 US list price; 94% positive from 7,553 English reviews on the page. | Island start, quests, upgrades, boats, collection and fishing. | Long-lived 2D game with a strong character hook and much lower hardware demands. |
| [Cast n Chill](https://store.steampowered.com/app/3483740/Cast_n_Chill/) | US$14.99; 95% positive from 4,813 English reviews; page describes 16 fishing spots and co-op. | Relaxing fishing, collection and progression have a visible audience on Steam. | Established, content-rich pixel-art game; not a price target for a smaller first release. |
| [Cozy Coast](https://store.steampowered.com/app/4938190/Cozy_Coast/) | US$4.99; 65 fish listed; page showed no user reviews when checked. | Low-price cozy fishing and short-session alternative. | Early Access desktop-pet/idle loop, not real-time 3D boating. |
| [Fishing Planet](https://store.steampowered.com/app/380600/Fishing_Planet/) | Free-to-play; page describes 300+ fish, 27 waterways and online play. | Free fishing is a strong alternative for players seeking content volume or competition. | Its service scale, multiplayer and in-app-purchase model are far beyond this solo project. |

Prices and review counts vary by date, region and promotion. Steam reviews do not equal sales, retention or market size. Recheck official pages before a pricing decision.
## Virality and player return

Virality cannot be guaranteed by adding share buttons. The current share card and friend duel are good starting points, but the invitation has to lead to a working game/store page and a first catch quickly.

1. **Make each catch card legible in a feed:** species, size, weight, rarity/record, location and Fishing Free mark; use a real in-game fish portrait. Keep the generated card attractive without claiming that a fish was caught on a public leaderboard.
2. **Make links useful before the app is installed:** use a public landing page with separate Steam, Google Play and App Store destinations. Add verified universal links/app links only after store IDs exist.
3. **Keep challenges small and friendly:** a shared species, habitat and time window, with an end date and a direct rematch. Clearly label client-reported scores. Do not award purchasable goods or run a public ranked ladder from the current prototype.
4. **Build reasons to return that respect the relaxed tone:** opt-in weekly fishing briefs, rotating habitat/species goals, new field-guide clues, photo prompts, and cosmetic boat/gear rewards earned through play. No loss for missing a day, energy timers, forced streaks or daily push notifications by default.
5. **Measure the funnel before buying traffic:** launch → first cast → first bite → first catch → sell/upgrade → second session → share → invitee opens game. Collect only the events needed for these product questions, disclose analytics, and provide a privacy contact before public store release.

### Early test gates (hypotheses, not industry benchmarks)

Use a closed cohort of at least 100 first-time players per platform before spending on acquisition. Review device-level cold-start time, crash-free launches, first-catch completion, exits during shader startup, D1/D7 return, share attempts and challenge-link opens. As initial **internal** gates, target at least 99.5% crash-free launches, 70% reaching a first playable action, and 25% D1 / 8% D7 return. If the sample is too small or skewed to friends, call the result inconclusive rather than a pass. Do not optimize these numbers by adding pressure mechanics.

## Monetization audit

### Current state

There is no store billing, advertising, entitlement validation or transaction server in the code. In-game dollars are earned by selling fish and are not real money. The complete current game is already available free on the web, and the selected name promises free access. Do not retroactively lock the current maps or show “Full Game” as purchasable. There is no current revenue forecast.

### Recommended first commercial model

| Platform | First model to test | Why it fits | Do not ship until |
|---|---|---|---|
| Steam / Windows | Keep the current game free. After retention and demand are measured, test one optional **new-island expansion** as paid Steam DLC; do not charge for maps already available in the free web game. Initial US price hypothesis: **US$2.99–4.99** for one substantial new region. Estimate its scope and cost before selecting a price; this is not a price commitment. | Aligns the “Fishing Free” name with the product promise and preserves the current free build. Steam supports free-to-play games with paid DLC; DLC ownership can be checked through Steamworks. That avoids adding a cash shop and transaction server for the first paid content. | A new expansion exists, free players still have a satisfying complete loop, the DLC entitlement is verified through Steam, Steamworks IDs/store approval are ready, and refunds/support are understood. |
| Android / iOS | Keep the current game free. If a substantial new expansion is produced, test a one-time non-consumable entitlement through Play Billing / StoreKit. Keep the web PWA's current content free; do not promise that purchases transfer between stores or platforms. | A calm offline game is poorly matched to intrusive ads, energy timers or subscriptions. A single content entitlement is easier to explain than a consumable economy. | Signed native builds, store products, purchase verification, restore, refunds, offline entitlement behavior, privacy disclosures and sandbox/test-track purchases all work. Apple device distribution also needs the required signing path. |
| Web PWA | Keep the current full game free; no web checkout in the first release. | Preserves the existing access promise and avoids adding accounts or a web-commerce/entitlement backend before demand is known. | Revisit only after a paid expansion exists and a fair, supportable entitlement path is designed. |
| Any platform, later | Optional cosmetic pack, with no gameplay stats or catch-rate advantage. | Preserves a fair fishing loop; art and support cost can be kept separate from core balance. | Enough active players ask for cosmetics, production cost is known, platform checkout is live and the purchase can be restored. |

The expansion prices above are **test hypotheses**, not selected prices or a revenue projection. The current free game has no paid expansion and generates no store revenue. Revisit pricing after scoping a new region, estimating its production/support cost, and testing player interest. The comparator table above gives current visible anchors; their business models, scope, age and budgets differ from Fishing Free. Compare our own free-to-paid expansion interest, wishlists, refunds, review sentiment and support cost after a closed test; do not forecast revenue from competitor review counts.

The free Steam base game already serves as the hands-on trial, so a separate demo is not the first commercial path. If the owner later chooses a paid base game, revisit the demo plan alongside the name and current free web version. Any demo must be polished and sequenced deliberately because it has a separate App ID and Steam's one-time demo wishlist notification window. See [Steamworks Demos](https://partner.steamgames.com/doc/store/application/demos?l=en) and [Free To Play Games](https://partner.steamgames.com/doc/store/freetoplay).

### Avoid for the first release

- **Ads:** breaks scenery and concentration and creates privacy/compliance work before retention is known.
- **Subscriptions:** the current game does not supply a dependable monthly stream of new value.
- **Loot boxes, paid random fish, bait energy or paid catch power:** conflicts with a fair cozy game and creates disclosure/regulatory obligations.
- **Cross-platform premium currency:** adds fraud, platform reconciliation, customer support and backend work without a validated audience.
- **Steam microtransactions at launch:** skip a cash shop. If in-game purchases are ever added, Valve requires Steam Wallet transactions; the project has neither that flow nor a secure entitlement backend. Use store DLC for substantial map/mission expansions instead. See [Steamworks Free To Play](https://partner.steamgames.com/doc/store/freetoplay) and [Steam Microtransactions](https://partner.steamgames.com/doc/features/microtransactions).

For digital features consumed inside a Play-distributed Android app, the current Google Play Payments policy generally requires Play Billing unless a stated exception/program applies. Apple’s guideline requires In-App Purchase for digital unlocks such as the full game. Policies differ by storefront/region and change; verify the exact launch countries before implementing billing. See [Google Play Payments policy](https://support.google.com/googleplay/android-developer/answer/9858738?hl=en), [Apple App Review Guidelines, section 3.1](https://developer.apple.com/app-store/review/guidelines/uk/), and [Apple's overview of setting up in-app purchases](https://developer.apple.com/help/app-store-connect/configure-in-app-purchase-settings/overview-for-configuring-in-app-purchases/).

## Ownership, naming and release readiness

- Keep the Fishing Free product name and user-owned repository identity, but clear title, domain and trademark availability before store submission. The repository slug and legacy save keys may retain Tidewater for compatibility.
- Preserve the root MIT license, upstream copyright, CREDITS.md and vendor/third-party asset notices in all source and shipping packages.
- The game package name is com.fishingfree.game. Existing legacy test builds using another package ID do not update in place; different Android signing certificates can also require uninstalling and may erase local saves.
- No Steam App ID/depot IDs or completed Steamworks onboarding are recorded. Steam Direct fee, review lead time and Coming Soon requirements are documented in STEAM.md; recheck Valve's current rules before scheduling.
- Store art concepts are drafts, and current screenshot previews do not show a normal gameplay HUD from the exact packaged build. Six shipping-build screenshots, trailer, support contact and privacy disclosures remain open.

## Order of work and exit criteria

### P0 — make the Windows and phone paths trustworthy

1. Obtain the Steamworks App ID and Windows depot ID and complete partner onboarding. Never put Steam passwords or Steam Guard codes in chat or source control.
2. Capture six distinct, unedited gameplay screenshots and a 45–60 second trailer from the actual 1.0.27 Windows build. Existing source-preview captures omit the normal HUD and are composition references only.
3. On a clean Windows 10/11 PC, verify WebGPU 3D, shader cold start, local save close/reopen, resizing, keyboard/mouse, physical gamepad and Steam overlay. Set honest minimum/recommended GPU requirements.
4. Install the current standalone APK on the Samsung A52 without overwriting valuable save data. Record Android, Chrome and Android System WebView versions, installation result, graphics/fallback, touch fishing, performance and offline relaunch. Test Android 10 separately and keep signing consistent for updates.
5. Check the iPhone PWA in Safari on a physical iPhone. Native iOS distribution remains blocked until there is an Apple signing path.
6. Clear title and legal/store assets. Preserve MIT and all third-party credits.
7. Submit the store page/build for Steam review only after the checks above. An Actions artifact is not a Steam release.

### P1 — validate the loop and discovery

- Run separate moderated sessions on desktop 3D, Android 3D where available, Android Scenic Fishing and iPhone PWA.
- Fix blocked boat recovery, unclear cast/fight controls, small-screen overlap, stuck camera, blank scenes and slow cold starts before adding large content.
- Recruit at least 100 first-time players per platform/mode. Compare first-catch completion and day-one/day-seven return by hardware and renderer; a friend-only or single-device sample is inconclusive.
- Track launch → first playable action → first bite → first catch → sell/upgrade → second session → share → invitee launch/first catch. Collect only needed events and disclose them.
- Publish a simple landing page with accurate media, support/privacy information and correct platform links. Buy no traffic until installation and first catch work.

Initial internal hypotheses, not industry benchmarks: at least 99.5% crash-free launches, 70% reaching a first playable action, 25% day-one return and 8% day-seven return. Also record median/p95 cold-start time, first-catch completion, shader/fallback exits, shares and challenge opens.

### P2 — grow when retention gives a reason

- Improve existing destinations, fish behavior, landmarks, recovery and tutorial clarity before building another large map.
- Add an optional weekly photo/species prompt only if it increases return without pressure.
- Harden friend challenges only if players share them: validate results server-side, add rate limits/moderation, and keep public rankings prize-free until anti-cheat is credible.
- Scope a new region only after players return for the current loop and show interest. Make it a complete experience, not a bundle of fish names.
- Reassess live multiplayer only after asynchronous challenges show repeat participation. PvP requires authoritative scoring, matchmaking, moderation and ongoing server operations; it should not delay solo release.

### P3 — monetize from evidence

- Survey the tested cohort about a genuinely new region, distinguishing curiosity from willingness to pay.
- Prototype a representative expansion slice and test it before committing the full production and support cost.
- Keep the base game free. A future US price hypothesis is US$2.99–4.99 for a substantial new region; it is not an approved price or revenue forecast. Steam can use store DLC; mobile needs separate Play Billing and StoreKit products, signed builds, entitlement verification, restore/refund and offline tests. Do not promise purchases transfer between stores.
- Avoid ads, subscriptions without a reliable monthly content cadence, loot boxes, paid catch power, energy timers and cross-platform premium currency. Do not add Steam microtransactions at launch.
- Monitor conversion, refunds, reviews, support time and ongoing content cost; stop or revise if the data does not support maintenance.

### Main risks and go/no-go rule

- **Startup/rendering:** WebGPU adapter failure or long shader compilation blocks first play. Scenic mobile mode has different visuals from 3D.
- **Save continuity:** saves are local and do not sync across devices. A differently signed APK may require uninstalling and erase the old local save.
- **Store readiness:** no SteamPipe upload, signed Play release, signed iOS IPA, approved title or final store media exists.
- **Provenance:** preserve upstream copyright/license and asset credits while using Fishing Free branding.
- **Commercial uncertainty:** there is no representative usage, retention, wishlist or revenue evidence. Competitor reviews/prices cannot fill that gap.
- **Operations:** current friend scores are not safe for ranked competition; multiplayer and paid digital items add security, moderation, privacy and support obligations.

**Go/no-go:** publish on a store only after installation, first playable action, save behavior, graphics/fallback and support are verified on real target hardware; title and media are cleared; and the submitted package is the same build that passed those checks. Keep monetization off until retention and expansion-demand tests are complete.
