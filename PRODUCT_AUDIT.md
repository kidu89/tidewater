# Fishing Free — product, market and monetization audit

**Snapshot:** 1 October 2026. This is a product decision document based on the checked-out source and published store/policy pages. It is not a forecast: there are no install, sales, retention, conversion or playtest results yet.

## Executive decision

**Keep developing; do not announce a release date or buy user acquisition yet.** The game has a memorable visual hook and a coherent solo loop, enough to justify a small closed test. The largest release risk is platform fit: the rich WebGPU build can fail to acquire a GPU adapter on a phone, while the Canvas phone mode is much simpler than the 3D game. The user-provided Android screenshots show the exact failure state (“No WebGPU adapter found”), so mobile startup is not considered solved until a freshly synced build is observed on the actual devices.

The best order is **Windows/Steam closed build → validate the first 20–30 minutes and performance → fix or deliberately redesign the mobile fallback → mobile test tracks → store launch**. Steam is a better first audience for the full 3D renderer, but still needs a Steamworks app and real Windows testing. The current Actions workflows package builds; they do not publish them.

## What is in the product now

- A browser-first custom WebGPU/WGSL island fishing game with a high-end ocean, atmosphere, day/night, boat, wildlife and photo mode.
- A repeatable fishing encounter: choose habitat and time, cast, wait, hook, manage line tension, land the fish, then decide whether to keep or sell it.
- Persistent solo progression: 22 species, logbook and records, contracts, 18 achievements, gear upgrades, boat fuel, and four destinations (the home island, Pelican Cay, Turtle Key and Mangrove Reach).
- Local save data and offline play. No account, cloud-save service, economy server or live matchmaking.
- Catch-card sharing and a friend-duel prototype. The hosted duel API is optional and scores are self-reported; it is not secure enough for ranked play, prizes or purchases.
- A Capacitor Android/iOS wrapper. A touch-first Canvas fishing mode is bundled when WebGPU cannot supply an adapter; that is a compatibility path, not a visual equivalent to the main renderer.
- A new Electron/Chromium Windows package path and manual GitHub Actions workflow. These were added in this development pass and still need a clean packaged launch on a second Windows machine.

## Product strengths and market fit

### Strengths worth protecting

1. **Recognizable scenery:** tropical island, ocean and whale are more ownable than a list of generic fishing mechanics. Store art and trailer need to show the real shipped game.
2. **Relaxation with a skill moment:** calm exploration switches into the tension-management fight. This gives clips and catch cards an understandable payoff.
3. **Useful solo scaffolding:** the maps, contracts, collection and equipment already give a reason to make several trips. Nothing requires an online account.
4. **One codebase for the first test:** the new Windows shell and Capacitor shell package the same web build, lowering iteration cost while the product is small.

### Market and positioning risks

- The fishing category is established and crowded. Fishing Planet is free-to-play and advertises multiplayer, in-app purchases and extensive content. DREDGE sells a distinctive authored adventure at a premium price. Fishing Free must lead with its quiet tropical exploration, real-time scenery and solo catch loop rather than claim to beat either on scale or realism.
- “Fishing Free” is descriptive, difficult to distinguish in search and may be confused with “free fishing games.” Treat it as a working title until Steam app-name, domain and trademark checks are complete.
- A premium-looking renderer raises expectations for camera feel, framerate, content density and controller support. The desktop game currently has no native gamepad mapping. Do not list controller or Steam Deck support until it has been tested.
- A screenshot of `chrome://gpu` showing WebGPU hardware acceleration only describes that Chrome build/device. It does not prove a Capacitor WebView can create the adapter the game needs. Android 10, Android 12, browser Chrome and Android System WebView must be recorded separately.
- The first full 3D launch compiles many shaders. If the first playable cast takes too long, mobile ratings, Steam reviews and sharing will suffer. Measure cold starts after reinstall and after cache warm-up.

### Recommended positioning

> A quiet tropical fishing trip: take the boat beyond the reef, learn where island fish bite, and bring home a catch worth remembering.

Primary audience: people who want a scenic, low-pressure solo fishing/exploration game, plus anglers who enjoy collecting species and improving a small boat. Avoid broad claims such as “realistic simulator,” “multiplayer,” “controller support,” “works on every phone,” or “cross-platform saves” until those features are true in the release build.

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

There is no store billing, advertising, entitlement validation or transaction server in the code. In-game dollars are earned by selling fish and are not real money. Do not add a paywall or show “Full Game” as already purchasable until the actual store product and restore flow exist.

### Recommended first commercial model

| Platform | First model to test | Why it fits | Do not ship until |
|---|---|---|---|
| Steam / Windows | Free, clearly bounded demo plus a one-time paid full game. Test a **US$6.99–9.99** launch-price bracket against the demo conversion and reviews; local prices and discounts differ. | Gives players a low-friction trial while avoiding a cash shop, always-online service and recurring content obligation. Current Steam examples range from $4.99 for a small cozy fishing game to $9.99 for Pro Fishing Simulator and $24.99 for DREDGE; they are reference points, not direct equivalents or proof of demand. | The demo is compelling, the paid build has more than a short scenery tour, the Steam page is approved, the name is cleared, and the Windows build survives clean-install and GPU testing. |
| Android / iOS | Free starter trip with a single, non-consumable “unlock full island” purchase. Test a **US$3.99–5.99** bracket only after the free loop demonstrates value. Keep the free mode complete enough to judge fishing. | A calm, offline game is poorly matched to intrusive interstitial ads, energy timers or subscriptions. A one-time unlock is easy to explain and does not require an online economy. | Play Billing and StoreKit products, purchase verification, restore purchases, refunds, offline entitlement behavior, privacy disclosures and sandbox/test-track receipts all work. |
| Any platform, later | Direct-priced cosmetic pack or substantial map/mission expansion. | Lets the core fishing economy remain fair and preserves the no-pay-to-win promise. | Enough active players ask for it; content scope and production cost are known; platform-specific checkout and support are live. |

The price brackets above are **test hypotheses**, not a revenue projection. Steam store search currently contains free-to-play fishing games, small $4.99 cozy fishing releases and larger premium games; discounting and regional pricing move observed prices. Compare player reviews, demo conversion, refunds, wishlists and support cost after the test. Do not forecast income from competitor review counts.

### Avoid for the first release

- **Ads:** breaks scenery and concentration and creates privacy/compliance work before retention is known.
- **Subscriptions:** the current game does not supply a dependable monthly stream of new value.
- **Loot boxes, paid random fish, bait energy or paid catch power:** conflicts with a fair cozy game and creates disclosure/regulatory obligations.
- **Cross-platform premium currency:** adds fraud, platform reconciliation, customer support and backend work without a validated audience.
- **Steam microtransactions at launch:** Steam requires Steam Wallet for transactions in a Steam build; the project has neither a wallet flow nor a secure entitlement backend.

For digital features consumed inside a Play-distributed Android app, the current Google Play Payments policy generally requires Play Billing unless a stated exception/program applies. Apple’s guideline requires In-App Purchase for digital unlocks such as the full game. Policies differ by storefront/region and change; verify the exact launch countries before implementing billing. See [Google Play Payments policy](https://support.google.com/googleplay/android-developer/answer/9858738?hl=en) and [Apple App Review Guidelines, section 3.1](https://developer.apple.com/app-store/review/guidelines/).

## Ownership, naming and release readiness

- The checked-out source is pushed to the owner's `kidu89/tidewater` repository on `main` at `1820444fbfb93247fa0a4c2bb9b89526f794ae4c`, authored as `kidu89`. GitHub Pages deployed this commit successfully, and `https://kidu89.github.io/tidewater/` serves the rebranded game. Android run `36868685249` and Windows package/smoke-test run `36868686225` both completed successfully from the `kidu89` session. The repository is still marked as a fork of `dgreenheck/tidewater`; app branding changed, while required upstream license and asset notices remain.
- The root `LICENSE` grants MIT permissions but requires its copyright and permission notice to remain with substantial copies. `CREDITS.md` and the asset-level licenses must also ship. Rebranding UI and package display names is fine; deleting the legal notices or presenting third-party assets as wholly original is not.
- The Windows package includes the MIT license and credits in `dist/legal/`. Audit every font, model, sound, logo, store screenshot and generated asset again before sale. Do not claim exclusive ownership of the upstream code or vendor assets.
- A GitHub-hosted iOS archive still needs the owner’s Apple signing certificate, password, provisioning profile and team ID. The repository is writable by its owner, but its Actions secrets page currently contains no repository or environment secrets. Do not commit signing files.
- Android, iOS and Windows now use the brand-aligned identifier `com.fishingfree.game`. This is a new mobile app identity; prior test APKs using `com.tidewater.game` do not upgrade in place. The original source license and credits remain packaged.
- No Steam App ID or depot IDs exist yet. Steam Direct currently charges US$100 per app (recoupable after US$1,000 adjusted gross revenue), requires a 30-day wait and a Coming Soon page live for at least two weeks for a first release. Steam's review typically takes 3–5 business days; plan at least 7. See [Steam Direct](https://partner.steamgames.com/steamdirect/) and [Steam's review process](https://partner.steamgames.com/doc/store/review_process?language=english).

## Order of work and exit criteria

### P0 — make builds trustworthy

- Put the current changes in a GitHub repository the release owner can write to; keep all upstream and asset notices.
- Build the Windows x64 folder and launch it from a clean directory without Node installed or a game website. Confirm a fresh save, return after relaunch, graphics settings, keyboard/mouse, external links, 16:9/ultrawide window resize, low-GPU fallback and Steam overlay on Windows 10/11.
- Install the rebranded Android 1.0.6 APK on the Samsung A52 and the reported Huawei device. The current 1.0.6 build was installed and launched only on the available x86_64 emulator so far. Record Android/WebView versions, whether `navigator.gpu` exists, whether `requestAdapter()` returns a value, and which game mode appears. Confirm that the loader reaches playable mode without staying at 2% or showing an adapter error.
- The owner has explicitly rejected the Canvas fallback's visual quality. Replace it with a higher-fidelity supported mobile renderer or enable the full renderer on supported devices, then validate it on real Android/iOS hardware. Do not treat the current Canvas mode as the final mobile product or describe it as visually equivalent to 3D.
- Generate the IPA from the Mac GitHub runner only after secrets are added and the artifact installs in TestFlight or on registered devices. Windows cannot sign iOS apps locally.

### P1 — validate the play loop and the name

- Run 5–10 moderated first-session playthroughs on Windows and each mobile mode; fix confusing controls, blocked startup, dead-end objectives and poor small-screen layout.
- Check the working title in Steamworks, app stores, domain results and trademark records before commissioning final logo/capsule art.
- Produce real screenshots/trailer from the build being submitted; complete store text, accessibility notes, age/content surveys, privacy disclosures and support contact.
- After the first 100-player cohort, keep/revise/stop based on stability, first-catch completion, return and playtester comments.

### P2 — monetize and grow only after evidence

- Implement the demo/full-game separation and paid unlocks behind platform billing; prove restore/refund/offline behavior in sandbox.
- Publish a landing page with install links, then instrument and verify the entire share→open→first-catch funnel with consent and a privacy policy.
- Run small, reversible price tests and one creator/angler playtest round. Reinvest only if demo completion, reviews and retained players support the cost.
- Add hosted friend challenges after deep links, server validation, rate limits, privacy and moderation are in place. Consider live multiplayer only if asynchronous challenges show repeat participation.

## Market references checked on 1 October 2026

- [Fishing Planet on Steam](https://store.steampowered.com/app/380600/Fishing_Planet/) — free-to-play fishing simulator with online modes and in-app purchases. Its current page reports 29,314 English reviews and 84% positive; the count/rating change over time.
- [DREDGE on Steam](https://store.steampowered.com/app/1562430/Dredge/?l=english) — authored single-player fishing adventure; listed at US$24.99 on the page when checked. Different scope and production level.
- [A Good Day Fishing on Steam](https://store.steampowered.com/app/3649860/) — small single-player/cozy fishing game; listed at US$4.99 when checked.
- [PRO FISHING SIMULATOR on Steam](https://store.steampowered.com/app/794180/PRO_FISHING_SIMULATOR/) — paid sim; listed at US$9.99 when checked.

Store prices, policies, title availability, platform coverage and review counts are volatile. Recheck them immediately before a pricing decision or submission.

## Current release candidate — 1 October 2026 (version 1.0.6)

- Current app source is on `main` at commit `1820444fbfb93247fa0a4c2bb9b89526f794ae4c`. GitHub Pages deployed that commit. The repository still carries GitHub's `forked from dgreenheck/tidewater` marker; required upstream license, credits and asset notices are preserved.
- The local Android debug APK is `Fishing-Free-Android-1.0.6-debug.apk`, package `com.fishingfree.game`, version code 7, min API 24 and target API 36. It is 54,833,204 bytes with SHA-256 `F017EEFD2AD1D83FEAC34A2E6FA14169B521E2897C5CD0FF6C5A9EA9FB9E6047`. It installed and launched on the Android 16 x86_64 emulator. The emulator has no WebGPU adapter, so the app enters the local Canvas fishing mode. Physical installation and graphics behavior on the Samsung A52 remain unverified.
- Android GitHub Actions run `36868685249` succeeded and produced the 51.7 MB `Fishing-Free-Android-APK` artifact (digest `sha256:977d31e7de75ead74f5f07dbe186d85ff11a88bd0d7868863feed870c11016d8`). Windows run `36868686225` succeeded and produced the 202 MB `Fishing-Free-Windows-x64` artifact (digest `sha256:8d201d44f6f7a902b837b85ba57b2f56b99fe4aa74e90cb8cf3b14ef41895f58`). The latter's CI smoke test launched the packaged executable and checked its local page; it is not a SteamPipe upload or a Steam-client install test.
- The iOS project metadata is aligned in the current working tree to version 1.0.6, build 7, bundle ID `com.fishingfree.game` and iOS 15 deployment. No signed IPA exists. GitHub Settings currently shows no repository or environment Actions secrets; an Apple team ID, distribution certificate/private key and matching provisioning profile are required before the iOS workflow can run.
- The latest user-provided `chrome://gpu` screenshot is from a Huawei ELE-L29 on Android 10. Chrome reports WebGPU acceleration, but that does not establish WebGPU availability inside the Capacitor Android System WebView. The owner separately identified a Samsung A52 on Android 12. Test the exact app build on each device before claiming compatibility.
- The owner has rejected the Canvas fallback's visual quality. Mobile graphics parity is an unresolved product blocker. A more capable renderer and real-device validation are needed; the existing Canvas mode is only a functional fallback.
- The Actions workflows are being upgraded from deprecated Node 20 action releases to current Node 24-compatible releases. The edits are local and still require a successful GitHub run before this maintenance work is considered shipped.
- Steam submission, a signed iOS build, store billing, and real-player market validation remain outstanding. Current monetization advice is a hypothesis, not measured willingness to pay or a revenue forecast.

## Earlier local verification — 1 October 2026 (version 1.0.4)

- `npm run build` completes with Vite 8.3.0. `npm test` passes the fishing/game-logic checks, headless WebGPU engine smoke test and whale-breach regression check. The whale peaks at 1.31 m above the water, then returns below the surface. The smoke test writes to the OS temporary directory instead of assuming `/tmp`.
- `npm audit` reports zero vulnerabilities across the dependency tree.
- Android 1.0.4 is a debug-signed sideload APK, package `com.fishingfree.game`, version code 5, minimum Android API 24 and target API 36. It is 54,833,016 bytes with SHA-256 `1C1A2FADC918333D058A654F5785EB35B25294979D6399929823B2753093CB86`. `zipalign` and `apksigner` verification passed (v2 signature). It was installed and launched on the available x86_64 emulator; physical-phone installation and graphics behavior remain unverified.
- iOS bundle display name and bundle ID are `Fishing Free` and `com.fishingfree.game`; Xcode metadata is version `1.0.4`, build `5`, deployment target iOS 15. An IPA has not been built or installed because Apple signing assets and a run of the iOS workflow are still missing.
- The Android Actions `debug-apk` run `36859878100` succeeded in 2m11s and uploaded a 51.7 MB artifact (GitHub digest `sha256:27ee860da8df57ee4180d921043ac0a30cd59f837eebe5a78752faa1bd3151ad`). The separate local 1.0.4 APK is signature-verified and contains the no-adapter phone-mode fallback; neither artifact has been tested on the owner's physical phone. The `play-release` path requires owner-supplied upload-key secrets, creates a signed APK plus AAB, assigns a unique increasing version code, verifies both signatures and removes the temporary keystore. No upload key or Play Console submission is available yet.
- The touch-first Canvas mode exposes the branded catch-card/share flow after a catch, including length, weight and record/new-species status. If no public URL is configured, share text no longer claims a challenge link is attached. Production web build and Android asset sync pass.
- The 1.0.4 Windows x64 Electron package contains `Fishing Free.exe` (245,780,992 bytes; SHA-256 `AC7EA694F2AF1E11F6CBE152D628D7DB442A7340AED919D5308D5E507575ACA1`). The local ZIP has 1,117 entries (215,957,133 bytes; SHA-256 `6C87799956621C483AF71D372CB26C582561E1152C8FE89E313F8CEA32C8A1A4`), including `resources/app.asar`; `dist/legal/LICENSE` and `dist/legal/CREDITS.md` are inside that archive. Electron skipped code signing. Windows Actions run `36860135612` succeeded in 1m19s: it staged the package under `Program Files`, launched the game and verified its bundled page over loopback. It uploaded a 202 MB artifact (GitHub digest `sha256:237834dba1df4d01e7c54546c1cb9031a2e113e40f3bc31b49f26c8203be15d9`). The local host's restricted workspace ACL still prevents direct launch from the checkout.
- `npm test` passed on 2026-10-01, including checks that the whale reaches a controlled peak 1.31 m above water and returns below the surface. The live Pages build passed. A first-launch browser check showed the desktop 3D renderer compiling shaders at 58% after 54 seconds; completion to the playable scene and cold-start duration still need measurement. The CI runs emitted Node 20 deprecation notices for older workflow action versions; they did not fail either build and should be upgraded before long-term release maintenance. Vite previously emitted a non-fatal warning that a `LocalLights.js` dynamic import is ineffective because the module is also statically imported. The iOS workflow still needs Apple signing secrets and an install verified through TestFlight or a registered device; no IPA exists. Steam publication still needs a Steamworks app/depot, approved store page and owner-run SteamPipe upload.
