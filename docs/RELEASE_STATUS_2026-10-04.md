# Fishing Free — release status

**Checked:** 4 October 2026. Source commit `a851aac30ae2f34a542a5570af5c3c1c25bf5963` is on `main` in `kidu89/tidewater`. App metadata is Fishing Free 1.0.25, Android code 25 and iOS build 25. GitHub Pages run #86 deployed 1.0.25 successfully.

## Current evidence

| Area | Verified state | Remaining gap |
|---|---|---|
| Mobile fallback | Web production build and `npm run mobile:sync:android` succeeded. When WebGPU startup fails, Scenic Fishing is bundled in the entry JavaScript and starts synchronously. The photographic scene and touch fishing remain usable without a 2D animation context. The service worker now generates a cache name from the app version. | No physical Samsung A52 or Huawei check of 1.0.25. The Android 16 emulator remains on 1.0.20 and was left intact. |
| Android APK | Local APK at `release/1.0.25-android-local/Fishing-Free-1.0.25-Android.apk`, 57,732,963 bytes; SHA-256 `D1AB20FADA929F5F9DF752B2EB979991337731E466566E532C74B0EEE9CB9176`. Package `com.fishingfree.game`; version 1.0.25/code 25; min API 24; target API 36. APK v2 signature, alignment, package metadata, cache name, fallback code and all six photos verified. Signer SHA-256 is `a6bcee7b761b12f3e85267f2579e9f3ec73609974d5fd0c8cb26dc37fb0507aa`. | Local debug signature differs from old Actions APKs. Installing over an older signature may require uninstalling and may erase local save. The APK is not Play-signed. Actions debug APKs still lack a stable signing key. |
| PWA / Pages | Pages [run #86](https://github.com/kidu89/tidewater/actions/runs/37154452558) succeeded for `a851aac`. The live HTML, hashed JS entry and `sw.js` all returned HTTP 200. Live `sw.js` contains `fishing-free-shell-1.0.25`; the JS entry contains the scenic action and save key. | No real-phone browser run yet. |
| Windows / Steam | Windows [Actions run #23](https://github.com/kidu89/tidewater/actions/runs/37154541032) succeeded on tag `desktop-v1.0.25`, commit `a851aac`. Artifact: 214,625,032 bytes, SHA-256 `sha256:beb16bbebcc4269d69251df86c7af9f8b00858354397955ee9b88bdc1ba14657`, retained until 17 October 2026. It passed executable existence and staged startup/loopback smoke. A separate local package at `release/1.0.25-local-windows/win-unpacked/` reports `Fishing Free.exe` version 1.0.25.0; executable SHA-256 `2D29C7216AA8EAC04D4ACB180F1D1F34CFD613D7E78F7FEFC0850DD46A675166`, `app.asar` SHA-256 `1B869C194DF0B1FCEDF26D2B61DBB5E7873CB43C5D77112C70E45E49416A2107`. | No local launch/Steam-client/controller test, Steamworks App/depot IDs, approved store media, SteamPipe upload or public release. Windows code signing is not configured. |
| iOS | Xcode metadata is version 1.0.25/build 25, bundle `com.fishingfree.game`. | No iPhone-installable signed IPA: no Apple Developer membership, certificate or provisioning profile. |
| Ownership / license | GitHub repository `kidu89/tidewater` is owner-controlled and reports `fork: false`; game-facing name is Fishing Free. MIT license and third-party credits remain present. | Preserve original MIT copyright and asset notices; do not remove authorship statements. Repository slug still says `tidewater`. |
| Product / revenue | Current product audit retains the free-base-game recommendation and test-first expansion. | No player retention, wishlist, conversion, sales or monetization data; no billing or ad SDK. |

## Key installation note

The emulator package is version 1.0.20/code 21 and is signed by a certificate different from the local 1.0.25 APK. I did not replace it, because doing so would remove the existing installation and can erase its save. The 1.0.25 APK uses this workstation's Android debug key; future local builds made here can keep that signer, while GitHub Actions debug builds may use another temporary key. A consistent Actions key would require storing the Android keystore and passwords as encrypted repository secrets. The automatic approval check rejected the attempted transfer of newly generated private signing material; nothing was transmitted or created. Do not treat the local candidate as a store release.

## Release gates still open

There is no Steamworks app/depot setup or SteamPipe upload, no owner-approved final store art/media, no physical Android test, no stable Android Actions signing key, and no signed iOS IPA. The market and monetization audit has no player-data evidence. The full end state requested for Steam and mobile release is not yet achieved.
