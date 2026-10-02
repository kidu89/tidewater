# Fishing Free — product, market and monetization audit

**Snapshot:** 2 October 2026. This is a product decision document based on the checked-out source and published store/policy pages. It is not a forecast: there are no install, sales, retention, conversion or playtest results yet.

## Current release checkpoint — 2 October 2026

This checkpoint supersedes status statements in the historical build notes below.

- **Repository and license:** the public owner repository is `kidu89/tidewater`; its current page has no fork marker. Keep the MIT `LICENSE`, `CREDITS.md` and third-party notices.
- **Windows:** Actions run [`36982834802`](https://github.com/kidu89/tidewater/actions/runs/36982834802) packaged current `main` commit `acc7f85` as app version 1.0.13. Build, executable-presence and packaged-startup checks passed. The `Fishing-Free-Windows-x64` artifact is 202 MB with digest `sha256:82c2c4f0e1979d91f62269122656ae67a0c1a2518916afe3d87c85809ba8521b`. The smoke check confirms the packaged app serves its bundled page over loopback; it does not confirm the 3D scene renders on a retail PC, Steam overlay/controller behavior, or a Steam install.
- **Android:** candidate 1.0.14, run [`36982891820`](https://github.com/kidu89/tidewater/actions/runs/36982891820) on commit `acc7f85`, passed APK integrity, signature, alignment and manifest checks. The adapter probe now tries Chrome's OpenGL ES compatibility level first on Android 10/11, with bounded individual attempts; Android 12+ keeps the core-first order. This is a better compatibility attempt, not proof that the 3D renderer works on a phone. The exact APK still needs checking on the Samsung A52 and Huawei ELE-L29.
- **iOS:** no signed IPA exists. The current Actions settings page has no repository or environment secrets; the workflow requires `IOS_TEAM_ID`, `IOS_CERTIFICATE_P12_BASE64`, `IOS_CERTIFICATE_PASSWORD` and `IOS_PROVISIONING_PROFILE_BASE64`.
- **Steam:** the internal store-copy draft, three-size capsule concept set and reproducible export script are in the repository. Pages run [`36982589977`](https://github.com/kidu89/tidewater/actions/runs/36982589977) succeeded after the adapter-probe update. These are not approved store assets or a Steam release: Steamworks App/depot IDs, owner-approved art, SteamPipe upload and a clean Steam-client install are outstanding.

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
- The installable PWA is deployed for supported mobile browser engines. Android 10+ APKs attempt to hand off to Chrome; Android 10 is best-effort, while Chrome's documented Android WebGPU support starts at Android 12 on supported Qualcomm or ARM GPUs. The Samsung A52 can use the full renderer only if Chrome returns a usable adapter. On Apple devices, WebKit documents WebGPU in Safari 26 on iOS 26. The PWA caches downloaded game assets, but it is not proof of physical-device performance or a substitute for signed Play/App Store releases.
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
- A premium-looking renderer raises expectations for camera feel, framerate, content density and controller support. Standard-mapped gamepad controls are implemented for play and basic menus, but they have not been checked on a physical controller or Steam Deck. Do not list verified controller or Steam Deck support until those checks pass.
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
| Steam / Windows | Free, clearly bounded demo plus a one-time paid full game. Test a **US$4.99–7.99** launch-price bracket against demo conversion, refunds and reviews; consider US$9.99 only if playtests show enough depth and replay value. Local prices and discounts differ. | Gives players a low-friction trial while avoiding a cash shop, always-online service and recurring content obligation. Storefront checks on 2 October 2026 show Fishing Planet as free-to-play with extensive online content, Cozy Coast at US$4.99 as a small idle fishing game, and DREDGE at US$24.99 as a substantially larger authored adventure. They are different scope anchors, not direct equivalents or proof of demand. | The demo is compelling, the paid build has more than a short scenery tour, the Steam page is approved, the name is cleared, and the Windows build survives clean-install and GPU testing. |
| Android / iOS | Free starter trip with a single, non-consumable “unlock full island” purchase. Test a **US$3.99–5.99** bracket only after the free loop demonstrates value. Keep the free mode complete enough to judge fishing. | A calm, offline game is poorly matched to intrusive interstitial ads, energy timers or subscriptions. A one-time unlock is easy to explain and does not require an online economy. | Play Billing and StoreKit products, purchase verification, restore purchases, refunds, offline entitlement behavior, privacy disclosures and sandbox/test-track receipts all work. |
| Any platform, later | Direct-priced cosmetic pack or substantial map/mission expansion. | Lets the core fishing economy remain fair and preserves the no-pay-to-win promise. | Enough active players ask for it; content scope and production cost are known; platform-specific checkout and support are live. |

The price brackets above are **test hypotheses**, not a revenue projection. Comparisons were checked against current Steam listings on 2 October 2026: [Fishing Planet](https://store.steampowered.com/app/380600/Fishing_Planet/) is free-to-play and advertises 300+ species, 27 waterways and daily missions; [Cozy Coast](https://store.steampowered.com/app/4938190/Cozy_Coast/) lists at US$4.99 and has 65 fish across four waters; [DREDGE](https://store.steampowered.com/app/1562430/Dredge/) lists at US$24.99 and has several paid expansions. Their business models, scope and production budgets differ from Fishing Free. Prices vary by country and sale. Compare our own demo conversion, refunds, wishlists, review sentiment and support cost after a closed test; do not forecast revenue from competitor review counts.

### Avoid for the first release

- **Ads:** breaks scenery and concentration and creates privacy/compliance work before retention is known.
- **Subscriptions:** the current game does not supply a dependable monthly stream of new value.
- **Loot boxes, paid random fish, bait energy or paid catch power:** conflicts with a fair cozy game and creates disclosure/regulatory obligations.
- **Cross-platform premium currency:** adds fraud, platform reconciliation, customer support and backend work without a validated audience.
- **Steam microtransactions at launch:** Steam requires Steam Wallet for transactions in a Steam build; the project has neither a wallet flow nor a secure entitlement backend.

For digital features consumed inside a Play-distributed Android app, the current Google Play Payments policy generally requires Play Billing unless a stated exception/program applies. Apple’s guideline requires In-App Purchase for digital unlocks such as the full game. Policies differ by storefront/region and change; verify the exact launch countries before implementing billing. See [Google Play Payments policy](https://support.google.com/googleplay/android-developer/answer/9858738?hl=en), [Apple App Review Guidelines, section 3.1](https://developer.apple.com/app-store/review/guidelines/uk/), and [Apple's overview of setting up in-app purchases](https://developer.apple.com/help/app-store-connect/configure-in-app-purchase-settings/overview-for-configuring-in-app-purchases/).

## Ownership, naming and release readiness

- The owner's repository is `kidu89/tidewater`, on `main`, with no GitHub fork marker. On 1 October 2026, the owner detached it from `dgreenheck/tidewater`. The latest Windows package is run [`36982834802`](https://github.com/kidu89/tidewater/actions/runs/36982834802) for app version 1.0.13; the latest Android package is run [`36982891820`](https://github.com/kidu89/tidewater/actions/runs/36982891820) for version 1.0.14. The root MIT `LICENSE`, `CREDITS.md` and third-party notices remain present.
- The root `LICENSE` grants MIT permissions but requires its copyright and permission notice to remain with substantial copies. `CREDITS.md` and the asset-level licenses must also ship. Rebranding UI and package display names is fine; deleting the legal notices or presenting third-party assets as wholly original is not.
- The Windows package includes the MIT license and credits in `dist/legal/`. Audit every font, model, sound, logo, store screenshot and generated asset again before sale. Do not claim exclusive ownership of the upstream code or vendor assets.
- A GitHub-hosted iOS archive still needs the owner’s Apple signing certificate, password, provisioning profile and team ID. The repository is writable by its owner, but its Actions secrets page currently contains no repository or environment secrets. Do not commit signing files.
- Android, iOS and Windows now use the brand-aligned identifier `com.fishingfree.game`. This is a new mobile app identity; prior test APKs using `com.tidewater.game` do not upgrade in place. The original source license and credits remain packaged.
- No Steam App ID or depot IDs exist yet. Steam Direct currently charges US$100 per app (recoupable after US$1,000 adjusted gross revenue), requires a 30-day wait and a Coming Soon page live for at least two weeks for a first release. Steam's review typically takes 3–5 business days; plan at least 7. See [Steam Direct](https://partner.steamgames.com/steamdirect/) and [Steam's review process](https://partner.steamgames.com/doc/store/review_process?language=english).

## Order of work and exit criteria

### P0 — make builds trustworthy

- Keep `kidu89/tidewater` detached from the upstream fork network; the public page has no fork marker. Preserve the MIT license, credits and asset notices.
- Windows CI now launches the packaged game from a staged directory and confirms its bundled page responds over loopback. Still verify the 3D scene on a retail GPU, save persistence, graphics settings, keyboard/mouse, external links, 16:9/ultrawide resizing and Steam overlay on a separate clean Windows 10/11 install.
- Install and identify the 1.0.14 debug APK (run [`36982891820`](https://github.com/kidu89/tidewater/actions/runs/36982891820)) on the Samsung A52 and Huawei ELE-L29. The Android 10/11 adapter order now prioritizes Chrome compatibility mode; use the in-app graphics report to record Android/Chrome versions, adapter outcomes, and which game mode appears. Treat compatibility as unverified until the exact APK reaches the 3D scene on both devices.
- The owner has explicitly rejected the Canvas fallback's visual quality. Replace it with a higher-fidelity supported mobile renderer or enable the full renderer on supported devices, then validate it on real Android/iOS hardware. Do not treat the current Canvas mode as the final mobile product or describe it as visually equivalent to 3D.
- Install the current 1.0.13 PWA on the Samsung A52 from Chrome. Verify that `navigator.gpu` returns an adapter, the 3D island reaches gameplay, touch controls respond, the game remains smooth after several minutes, and cached assets allow a later offline launch. Repeat with Safari on a supported iOS 26 device. The current code/build work alone is not this device evidence.
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

## Earlier local verification — 1 October 2026 (version 1.0.6)

- Current app source and release workflows are on `main` at commit `d61c72a344866a77c27fd2aa27056698c4dfa94b`. GitHub Pages run `36871617734` deployed that commit. The repository still carries GitHub's `forked from dgreenheck/tidewater` marker; required upstream license, credits and asset notices are preserved.
- The local Android debug APK is `Fishing-Free-Android-1.0.6-debug.apk`, package `com.fishingfree.game`, version code 7, min API 24 and target API 36. It is 54,833,204 bytes with SHA-256 `F017EEFD2AD1D83FEAC34A2E6FA14169B521E2897C5CD0FF6C5A9EA9FB9E6047`. It installed and launched on the Android 16 x86_64 emulator. The emulator has no WebGPU adapter, so the app enters the local Canvas fishing mode. Physical installation and graphics behavior on the Samsung A52 remain unverified.
- Android GitHub Actions run `36871713285` succeeded and produced the 51.7 MB `Fishing-Free-Android-APK` artifact (digest `sha256:9ba9d1edfbfeb7033bcd3ca9e3bc0284dbe1b9a20c6df3bd5a5602aa77c10cac`). Windows run `36871764858` succeeded and produced the 202 MB `Fishing-Free-Windows-x64` artifact (digest `sha256:36dd2baa8846f80bb590f84343ce6b5de95b6786226347dbb6ccf9d62445cf07`). The Windows CI smoke test launched the packaged executable and checked its local page; this is not a SteamPipe upload or a Steam-client install test. Pages run `36871617734` succeeded for the pushed source.
- The iOS project metadata is aligned to version 1.0.6, build 7, bundle ID `com.fishingfree.game` and iOS 15 deployment. No signed IPA exists. GitHub Settings currently shows no repository or environment Actions secrets; an Apple team ID, distribution certificate/private key and matching provisioning profile are required before the iOS workflow can run.
- The latest user-provided `chrome://gpu` screenshot is from a Huawei ELE-L29 on Android 10. Chrome reports WebGPU acceleration, but that does not establish WebGPU availability inside the Capacitor Android System WebView. The owner separately identified a Samsung A52 on Android 12. Test the exact app build on each device before claiming compatibility.
- The owner has rejected the Canvas fallback's visual quality. Mobile graphics parity is an unresolved product blocker. A more capable renderer and real-device validation are needed; the existing Canvas mode is only a functional fallback.
- The Actions workflows now use Node 24-compatible releases for checkout, Node setup and artifact upload; the Pages workflow also uses the current Pages actions and has explicit `actions: read` permission. The latest Android, Windows and Pages workflows all passed without the earlier Node 20 deprecation warnings.
- Steam submission, a signed iOS build, store billing, and real-player market validation remain outstanding. Current monetization advice is a hypothesis, not measured willingness to pay or a revenue forecast.

## Previous verified CI builds — version 1.0.7 (1 October 2026)

- The current `main` commit is `d6b66c96fc4100d0b9fa9febd4d682867ba82716`; Android version code and iOS build are 8. Android Actions run [`36878532424`](https://github.com/kidu89/tidewater/actions/runs/36878532424) succeeded and produced the 51.7 MB `Fishing-Free-Android-APK` artifact (digest `sha256:01cf004a168456fe18e673406d3e3377db4870661484c20b4c1a4b5445a7f05f`). Windows Actions run [`36878533392`](https://github.com/kidu89/tidewater/actions/runs/36878533392) succeeded and produced the 202 MB `Fishing-Free-Windows-x64` artifact (digest `sha256:9ea4e5b98e9c0dc1facb458abbeadc61d91f7579c59b1cc3b9f77e02f36d9c62`); its launch smoke test passed. The artifacts are temporary CI downloads, not store releases; neither run installs on a real phone, Steam, or a retail PC.
- Standard-mapped gamepad support covers movement, swimming, boat steering, camera look, fishing triggers, interactions, modal navigation and the first-start prompt. It has not been checked on a physical controller or Steam Deck.
- The existing Canvas mobile fallback still fails the owner's visual-quality requirement. Version 1.0.7 does not resolve mobile renderer parity, and it must not be treated as the final Android or iOS release. Android phone/WebView startup and controller support remain unverified on hardware.
- Next release evidence: validate 1.0.7 on the Samsung A52 and Huawei phone; address mobile renderer parity; test the Windows package with a physical controller and Steam client; obtain Apple signing assets and produce an install-verified IPA.

## Previous verified CI builds — version 1.0.8 (1 October 2026)

- Current `main` commit: `37a9f31cd8f73f89c8af7c4ed1ec3a65b577751b`; Android version code and iOS build are 9. The production web build succeeds. Pages run `36883908692` deployed the source. Android Actions run [`36883963522`](https://github.com/kidu89/tidewater/actions/runs/36883963522) succeeded and produced a 51.7 MB `Fishing-Free-Android-APK` artifact (digest `sha256:43d3b8a81507b76c0ceaaae30d4f4ad38b4c5a19443acf6968c6af49706a53b7`). Windows Actions run [`36883964645`](https://github.com/kidu89/tidewater/actions/runs/36883964645) succeeded and produced a 202 MB `Fishing-Free-Windows-x64` artifact (digest `sha256:0f3147f29b5f340da67a4daee507a1fc5fdcbc68f653e3b571ab4b3d5e6e0b6a`); its packaged startup smoke test passed. These are CI artifacts, not Play Store, Steam, or signed iOS releases.
- The phone fallback now provides an optional local graphics report with OS, Chromium/WebKit version, secure-context status, WebGPU API presence, adapter request results and the reason the 3D renderer fell back. The report is not sent over the network; the player chooses whether to copy it.
- This diagnostic improves fault isolation only. The Canvas fallback still does not meet the owner's visual-quality requirement, WebGPU behavior is unverified on both physical phones, and 1.0.8 is not a mobile graphics fix. The debug APK has not been installed and checked on a physical device.
- Next: use the report from the Samsung A52 and Huawei phone; choose a supported rendering path that preserves the intended 3D visuals; continue the physical Windows/Steam, iOS signing, and storefront validation gates above.

## Latest verified CI builds — version 1.0.9 (1 October 2026)

- Source commit `96967e054ea59a573e00eaaab96f7146e3aad1b2` has Android version code 10 and iOS build 10. Pages run [`36888626014`](https://github.com/kidu89/tidewater/actions/runs/36888626014) succeeded. Android run [`36888737239`](https://github.com/kidu89/tidewater/actions/runs/36888737239) produced a 51.7 MB debug APK (digest `sha256:d15348fc4443107f08a3a6388da8ccdc42b4d25750ac164905695066f566f269`). Windows run [`36888737851`](https://github.com/kidu89/tidewater/actions/runs/36888737851) produced a 202 MB x64 package (digest `sha256:a5f35b9ffd8be76179ba45156ddcfb974895a3dba15ccbbdf2559a94f42022b9`); the packaged startup smoke test passed.
- The boat now surfaces the emergency tow prompt if it remains grounded in shallow water. Build success confirms packaging only; recovery still needs a gameplay pass. The APK has not been installed on the Samsung A52 or the Huawei phone.

## Latest verified CI builds — version 1.0.10 (1 October 2026)

- Commit `fa71a3e4235956fc5e84fdaf95d1323bcd993749` has Android version code 11 and iOS build 11. Pages run [`36890187756`](https://github.com/kidu89/tidewater/actions/runs/36890187756) succeeded. Android run [`36890236881`](https://github.com/kidu89/tidewater/actions/runs/36890236881) produced a 51.7 MB debug APK (digest `sha256:ea9e2753af910aa033fa2c1e920f811f6106f73fe70b235c3daa9582c6e51045`). Windows run [`36890236517`](https://github.com/kidu89/tidewater/actions/runs/36890236517) produced a 202 MB x64 package (digest `sha256:5c16fb5a8e3a43c3df2602be609d9ba46e97f3b70c6b4fc6f58fbed4e6853bb0`); its packaged startup smoke test passed.
- The whale breach has a lower, energy-limited arc and its re-entry splash now triggers at the waterline. Version 1.0.9 adds an emergency tow prompt when a boat remains grounded in shallow water. These packages passed build checks, but the boat recovery and whale re-entry still need player verification.
- The 1.0.10 debug APK has not been installed on the Samsung A52 or Huawei phone. Mobile renderer quality also remains unresolved: the Canvas fallback still does not meet the owner's visual-quality requirement, and WebGPU behavior is unverified on both phones. Collect the local graphics report and verify both gameplay changes in play.

## Installable mobile PWA — version 1.0.11 deployment

- Version 1.0.11 adds a web app manifest, branded raster icons, standalone display metadata and a service worker that caches the page shell and same-origin game assets as they load. The Pages workflow now builds with the `/tidewater/` base path so that PWA start URL and worker scope remain inside the project site.
- Local `npm run build` succeeded and the generated manifest includes 192×192 and 512×512 Android icons plus an Apple touch icon. GitHub Pages run [`36898019140`](https://github.com/kidu89/tidewater/actions/runs/36898019140) completed successfully for commit `490f65a54d476114e8c5bcd8153ef11b88f42ea3`. Live checks returned HTTP 200 for the game page, `manifest.webmanifest`, `sw.js`, and all three raster icons. Chrome installation, offline restart and real-device gameplay have not yet been verified.
- The intended Samsung A52 path is Chrome's standalone PWA, which avoids relying on Android System WebView for WebGPU. Chrome documents mobile Android WebGPU support on Android 12+ with Qualcomm or ARM GPUs; the user's Huawei screenshot identifies Android 10 and is below that documented support floor. Safari 26 added WebGPU for iOS 26, so older iOS devices still have the Canvas fallback. Sources: [Chrome Android WebGPU support](https://developer.chrome.com/blog/new-in-webgpu-121/) and [WebKit WebGPU demo/support page](https://webkit.org/demos/webgpu/).
- The 1.0.11 source assigns Android version code 12 and iOS build 12. The corresponding debug APK and signed IPA have not been built. The PWA does not replace Play App Signing, App Store signing, or approval.

## Android Chrome handoff — version 1.0.12 package

- On Android 12+, the launcher now opens the deployed PWA in the installed Chrome app so the game can use Chrome's WebGPU path instead of depending on Android System WebView. If Chrome cannot be opened, the bundled Capacitor/Canvas game remains the fallback. This preserves the user's sideloaded-APK installation path while routing the Samsung A52 toward the intended renderer.
- This handoff launches a hosted page: the first launch needs internet, and the PWA service worker caches assets as they load for later offline launches. Android versions before 12 continue to use the bundled Canvas game because Chrome's published WebGPU support begins at Android 12 on supported Qualcomm/ARM GPUs.
- GitHub Actions run [`36899442319`](https://github.com/kidu89/tidewater/actions/runs/36899442319) completed successfully for tag `android-v1.0.12` and uploaded the 54.6 MB `Fishing-Free-Android-APK` artifact (digest `sha256:d64c8865785833399775e5c10a8078ab519f171b6c58361cac7178927dd5ceff`). Source version is 1.0.12, Android version code 13 and iOS build 13. The APK has not been installed or checked on a physical A52; the external Chrome launch and WebGPU adapter acquisition are still device gates. The PWA itself was deployed and its manifest/worker/assets returned HTTP 200 in the 1.0.11 deployment.

## Windows package — version 1.0.12 local build

- `npm run desktop:package:win` completed successfully and produced `release/win-unpacked/` (449,101,122 bytes across 884 files). The `Fishing Free.exe` launcher is present. A 216,377,690-byte ZIP transport archive was created with SHA-256 `04D1DA8CCB23C086EEF3D8A1B914DFE77C2C52C4F43D83C6D6D4E0949B40513C`.
- This local x64 package is unsigned and was not launched from a clean install or through Steam. It is not a Steam upload. Steamworks App ID, Windows depot, store approval and a clean Steam install/overlay check remain outstanding.

## Previous web and Windows verification — version 1.0.12 (1 October 2026)

- Commit `7bf5a533ec36d9d3511f089cb1ca67088e5466ba` limits humpback pitch during a breach in addition to the existing height limit. GitHub Pages run [`36902277901`](https://github.com/kidu89/tidewater/actions/runs/36902277901) completed successfully for this commit. The web update has not yet been checked in live gameplay.
- Windows run [`36903452261`](https://github.com/kidu89/tidewater/actions/runs/36903452261) built commit `7bf5a53`, passed the executable check and packaged-startup smoke test, and uploaded the `Fishing-Free-Windows-x64` artifact. The test launched the packaged app and confirmed its bundled page answered over loopback; no Steam client or clean retail PC test has been done.
- The Android 1.0.12 APK still opens the hosted PWA on Android 12+, so the deployed whale fix is served from the web build. The APK has not been reinstalled or gameplay-checked on the Samsung A52; it remains a debug-signed test package, not a Play release. No signed iOS IPA exists; the workflow requires an Apple signing certificate and provisioning profile.
- Boat recovery code rights an overturned or sunk hull and provides emergency tow through **B** / **Tow**. Actual recovery behavior has not been confirmed on the user's device.
- GitHub still identifies `kidu89/tidewater` as a fork of `dgreenheck/tidewater`. Detaching it requires the account owner's GitHub sudo reauthentication; this step is pending. Keep the MIT license and third-party credits when the repository is detached.

## Latest release-candidate build — version 1.0.13 (1 October 2026)

- Commit `500d269` adds an explicit harbor-tow prompt after a capsize, lowers the walk-to-boat separation threshold from 60 m to 32 m when the boat is not moored, sets the offline-cache version to 1.0.13, and increments Android/iOS build numbers to 14. GitHub Pages run [`36909661173`](https://github.com/kidu89/tidewater/actions/runs/36909661173) completed successfully and deployed the update.
- Windows Actions run [`36909904619`](https://github.com/kidu89/tidewater/actions/runs/36909904619) completed successfully for `main`. Packaging, executable-presence, packaged-startup smoke checks and artifact upload all passed. The `Fishing-Free-Windows-x64` artifact is 202 MB (digest `sha256:6d9c9b1bd628d2abd0423b626dc3e4791dacebd9fc85f98d66755d66e6052319`). The local 1.0.13 x64 ZIP is 216,377,568 bytes (SHA-256 `C1685C783C74C3FB733545694ECF1C011E8C72E4209ACB77ABF8C732A4675D56`). It is unsigned; no Steam client install or physical Windows-machine test has been done.
- Android Actions run [`36911231911`](https://github.com/kidu89/tidewater/actions/runs/36911231911), from workflow-only commit `7be932f`, completed successfully and uploaded the 1.0.13 debug APK artifact (52.1 MB; digest `sha256:7f1fbc3d42d5890e7410a175fe19e1fdf1a929a0c21def542aef803c5ba1d4ed`). Before upload, CI verified ZIP integrity, APK signature, 4-byte alignment, package ID `com.fishingfree.game`, version code 14, version name 1.0.13 and min API 24. The APK has not been installed or gameplay-checked on the Samsung A52; it is not a signed Play release.
- iOS project metadata is now version 1.0.13/build 14, but no signed IPA exists. The workflow still needs the owner's Apple Developer signing certificate, matching provisioning profile and team ID in GitHub Actions secrets. Steamworks App ID/depot, SteamPipe upload, approved store page and real Steam-client installation remain outstanding.

## Android Chrome handoff candidate — version 1.0.14 (1 October 2026)

- Android commit `f8a464f` extends the external Chrome handoff from Android 12+ to Android 10+. This targets the Huawei ELE-L29 report where Chrome lists WebGPU as hardware accelerated while the APK's embedded WebView reported no adapter. Chrome's documented default Android WebGPU support starts at Android 12 on Qualcomm or ARM GPUs, so Android 10 remains best-effort; Chrome's GPU feature status does not prove this game can acquire a GPU adapter. The hosted page switches to the Canvas fishing mode if adapter creation fails.
- Android app version is 1.0.14, version code 15. Workflow commit `0a2c80e` updates the APK manifest verification. Android Actions run [`36913925368`](https://github.com/kidu89/tidewater/actions/runs/36913925368) succeeded and uploaded the 52.1 MB `Fishing-Free-Android-APK` artifact (digest `sha256:843c5e932b80176b1741582e9dec8a1983d9ab8633bb05aefe453a316793ad22`). CI verified ZIP integrity, APK signature, 4-byte alignment, package ID, version and min API 24 before upload.
- This package has not been installed on either physical phone. The Samsung A52 Android 12 3D startup, Huawei Android 10 adapter acquisition, first online launch and actual visual quality remain unverified. The web game/PWA remains version 1.0.13; the Windows candidate remains 1.0.13 and iOS metadata remains 1.0.13/build 14. This Android package is for sideload testing, not Play Store distribution.
## Earlier local verification — 1 October 2026 (version 1.0.4)

- `npm run build` completes with Vite 8.3.0. `npm test` passes the fishing/game-logic checks, headless WebGPU engine smoke test and whale-breach regression check. The whale peaks at 1.31 m above the water, then returns below the surface. The smoke test writes to the OS temporary directory instead of assuming `/tmp`.
- `npm audit` reports zero vulnerabilities across the dependency tree.
- Android 1.0.4 is a debug-signed sideload APK, package `com.fishingfree.game`, version code 5, minimum Android API 24 and target API 36. It is 54,833,016 bytes with SHA-256 `1C1A2FADC918333D058A654F5785EB35B25294979D6399929823B2753093CB86`. `zipalign` and `apksigner` verification passed (v2 signature). It was installed and launched on the available x86_64 emulator; physical-phone installation and graphics behavior remain unverified.
- iOS bundle display name and bundle ID are `Fishing Free` and `com.fishingfree.game`; Xcode metadata is version `1.0.4`, build `5`, deployment target iOS 15. An IPA has not been built or installed because Apple signing assets and a run of the iOS workflow are still missing.
- The Android Actions `debug-apk` run `36859878100` succeeded in 2m11s and uploaded a 51.7 MB artifact (GitHub digest `sha256:27ee860da8df57ee4180d921043ac0a30cd59f837eebe5a78752faa1bd3151ad`). The separate local 1.0.4 APK is signature-verified and contains the no-adapter phone-mode fallback; neither artifact has been tested on the owner's physical phone. The `play-release` path requires owner-supplied upload-key secrets, creates a signed APK plus AAB, assigns a unique increasing version code, verifies both signatures and removes the temporary keystore. No upload key or Play Console submission is available yet.
- The touch-first Canvas mode exposes the branded catch-card/share flow after a catch, including length, weight and record/new-species status. If no public URL is configured, share text no longer claims a challenge link is attached. Production web build and Android asset sync pass.
- The 1.0.4 Windows x64 Electron package contains `Fishing Free.exe` (245,780,992 bytes; SHA-256 `AC7EA694F2AF1E11F6CBE152D628D7DB442A7340AED919D5308D5E507575ACA1`). The local ZIP has 1,117 entries (215,957,133 bytes; SHA-256 `6C87799956621C483AF71D372CB26C582561E1152C8FE89E313F8CEA32C8A1A4`), including `resources/app.asar`; `dist/legal/LICENSE` and `dist/legal/CREDITS.md` are inside that archive. Electron skipped code signing. Windows Actions run `36860135612` succeeded in 1m19s: it staged the package under `Program Files`, launched the game and verified its bundled page over loopback. It uploaded a 202 MB artifact (GitHub digest `sha256:237834dba1df4d01e7c54546c1cb9031a2e113e40f3bc31b49f26c8203be15d9`). The local host's restricted workspace ACL still prevents direct launch from the checkout.
- `npm test` passed on 2026-10-01, including checks that the whale reaches a controlled peak 1.31 m above water and returns below the surface. The live Pages build passed. A first-launch browser check showed the desktop 3D renderer compiling shaders at 58% after 54 seconds; completion to the playable scene and cold-start duration still need measurement. The CI runs emitted Node 20 deprecation notices for older workflow action versions; they did not fail either build and should be upgraded before long-term release maintenance. Vite previously emitted a non-fatal warning that a `LocalLights.js` dynamic import is ineffective because the module is also statically imported. The iOS workflow still needs Apple signing secrets and an install verified through TestFlight or a registered device; no IPA exists. Steam publication still needs a Steamworks app/depot, approved store page and owner-run SteamPipe upload.
