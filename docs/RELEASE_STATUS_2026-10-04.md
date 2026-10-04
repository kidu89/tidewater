# Fishing Free — release status

**Historical snapshot:** checked 4 October 2026 — Fishing Free 1.0.28, Android code 28, iOS build 28. Source commit `3d47658b568fa634db480d1e0b01738f497a2f23` was the baseline for tags `android-v1.0.28` and `desktop-v1.0.28`.

## 1.0.28 evidence snapshot (historical)
These rows record the previous candidate. The current 1.0.29 release evidence is below.

| Area | Verified state | Remaining gap |
|---|---|---|
| Mobile startup | Local 1.0.28 installed on a clean Android 16 x86_64 emulator. It launched into Scenic Fishing, showed version 1.0.28, accepted a touch cast and displayed a bite. This fallback uses high-resolution scene art and touch fishing; it is not real-time 3D. | No physical Samsung A52, Huawei ELE-L29 or MuMu Player check. Full WebGPU 3D on phones remains unverified. |
| Android APK | Local APK `release/1.0.28-android-local/Fishing-Free-1.0.28-Android.apk`, 57,732,385 bytes; SHA-256 `01A6DBBC4EB3E774316ADCAA5D2F6674F0EF19E3FAFCC0A06E34E972F16CF183`. Package `com.fishingfree.game`, version 1.0.28/code 28, min API 24, target API 36. APK v2 signature and 4-byte alignment verified; local signer SHA-256 `a6bcee7b761b12f3e85267f2579e9f3ec73609974d5fd0c8cb26dc37fb0507aa`. Actions [run 37168743935](https://github.com/kidu89/tidewater/actions/runs/37168743935) passed and uploaded an APK artifact with archive digest `sha256:fa1ed5cfee64fe058f22e23b6ab7ebf9cad1dc8c154214c097cdcafbbddbb288`, retained until 18 October 2026. | Debug signing is not a Play upload key. Actions and local debug keys can differ; Android can refuse updates across different signatures. The tested emulator was a fresh install. |
| PWA / Pages | 1.0.28 deployed successfully from this commit in [run 37168627882](https://github.com/kidu89/tidewater/actions/runs/37168627882). The splash and Scenic Fishing show the app version; native builds remove the game's old service worker/cache while browser PWA caching remains enabled. | No physical-phone browser check. |
| Windows / Steam | Actions [run 37168743697](https://github.com/kidu89/tidewater/actions/runs/37168743697) built the 1.0.28 x64 package and passed executable and staged startup/loopback checks. Artifact size 214,625,156 bytes; archive digest `sha256:3fcff4b87b2149c24b56ac03b5289388510fe1ba5367462086b6005696fe4d25`; expires 18 October 2026. | Package is unsigned; no Steam App/depot IDs, store approval, SteamPipe upload, Steam-client overlay/controller or Steam Deck check. Clean retail-PC WebGPU startup remains unverified. |
| iOS | Xcode simulator workflow [run 37168627889](https://github.com/kidu89/tidewater/actions/runs/37168627889) built an unsigned simulator app archive (55,066,086 bytes; digest `sha256:41c084462f172aaac787bfef6b7ceb6d678e9826486177de89bb4a3a2fb6e509`). Metadata is version 1.0.28/build 28, bundle `com.fishingfree.game`, deployment target iOS 15. | This simulator artifact cannot install on iPhone. There is no signed IPA: the owner has a personal Apple ID but no Apple Developer membership, certificate or provisioning profile. Safari PWA remains the iPhone route. |
| Ownership / license | Repo is `kidu89/tidewater`; game-facing name is Fishing Free. MIT license and third-party credits remain. | Preserve original MIT copyright and asset notices. |
| Product / revenue | Existing audit recommends a free base game and measured, test-first expansion. | No representative retention, wishlist, conversion, sales or willingness-to-pay data; no billing or ad SDK. |

## Install note

The local 1.0.28 debug APK installed successfully on a clean emulator. Its signer matches the prior local 1.0.27 build, but may differ from a GitHub Actions APK already on a phone. Do not uninstall an existing app before backing up its local save; Android rejects an in-place update when signatures differ.

## Release gates still open

Physical Android installation/gameplay, full mobile WebGPU validation, signed Play release, signed iOS IPA, Steamworks IDs and SteamPipe upload remain outstanding. Monetization decisions still need player data.

## Current candidate: Fishing Free 1.0.29 — 4 October 2026

- Added a weekly harbor brief to Scenic Fishing. The rotating objective is limited to the six Scenic habitats and their existing scenes; only three location-based briefs are reachable in this mode; qualifying fish advance it, progress saves in the existing phone-mode save, and the player can claim the in-game cash reward once each UTC week.
- Production web build and Capacitor Android sync succeeded. The APK is at release/1.0.29-android-local/Fishing-Free-1.0.29-Android.apk (57,761,153 bytes; SHA-256 2409BC064353A00BBF36C89064D5676788379AE87AF08F5186A5E416679DBA29). Package com.fishingfree.game, version 1.0.29/code 29, min API 24, target API 36. APK v2 signature and 4-byte alignment verified; local debug signer matches 1.0.28.
- Installed over 1.0.28 on the Android 16 x86_64 emulator. Scenic scene, weekly card, cast and fish-bite states were visually confirmed. Full eligible catch, reward claim and restart persistence were not verified end-to-end.
- Android source commit 771ab24 and tag android-v1.0.29 are pushed. Android Actions [run #26](https://github.com/kidu89/tidewater/actions/runs/37172317923) passed; Pages [run #100](https://github.com/kidu89/tidewater/actions/runs/37173206912), iOS Simulator [run #7](https://github.com/kidu89/tidewater/actions/runs/37173206919), and Windows Steam [run #27](https://github.com/kidu89/tidewater/actions/runs/37173986774) passed for the 1.0.29 source. Physical Samsung A52, MuMu Player, Huawei ELE-L29, WebGPU 3D, signed Play and iOS install checks remain open.
- Local Windows x64 folder `release/1.0.29-windows-candidate/win-unpacked/`: 752 files, 450,751,119 bytes; executable 1.0.29.0, PE x64, SHA-256 `C45C6B3D11EA2EBC341E03751542E1C90DA9E57FD767F8D319060EB08CEF6C86`. ZIP handoff is 218,302,372 bytes; SHA-256 `78E8E27E84173F4FA76C13F8910311944FA9F20AB4B7882B187CC81104023C44`. Windows Actions #27 uploaded a 214,625,301-byte artifact (digest `sha256:db283e3e7a34316cebe74c8970bcff72409edfd91d9c3832cc9f128d12004383`) and passed staged startup checks. This unsigned folder is not yet uploaded through SteamPipe.


## Current source candidate: Fishing Free 1.0.30 — 4 October 2026

- Added JSON export/restore for Scenic Fishing and local 3D saves. Imports are size-limited, schema-checked, normalized through the game save model, confirmed before replacement, and rolled back if storage writes fail.
- Android sync and Vite production build completed. Local Gradle APK packaging is unavailable on this PC because Android SDK location is not configured. Android version is 1.0.30/code 30, minimum API 24, target API 36.
- GitHub Actions Android artifact and physical Samsung A52/MuMu checks are pending. Existing repository authentication works in the terminal (git ls-remote succeeded), so no Git Credential Manager popup is required to push.
- iOS project metadata is 1.0.30/build 30. The owner has no Apple Developer membership or signing assets; this remains an unsigned simulator/PWA path, not an installable IPA.
- Previous installed/verified Android artifact remains version 1.0.29 until the 1.0.30 Actions build completes. Do not uninstall an existing install without saving its progress first.
