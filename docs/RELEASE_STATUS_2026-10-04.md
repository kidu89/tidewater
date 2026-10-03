# Fishing Free — release status

**Checked:** 4 October 2026. App metadata is Fishing Free 1.0.25, Android version code 25, iOS build 25. The previous published commit remains `c119a75`; version 1.0.25 source changes are local until pushed.

## Current evidence

| Area | Verified state | Remaining gap |
|---|---|---|
| Mobile fallback | Web production build and `npm run mobile:sync:android` succeeded. When WebGPU startup fails, the scenic fallback is imported statically and starts synchronously. The photographic scene and touch fishing work without a 2D animation context. The service worker now generates a cache name from the package version. | No physical Samsung A52/Huawei check of 1.0.25. The Android 16 emulator remains on 1.0.20 and was left intact. |
| Android APK | Local APK at `release/1.0.25-android-local/Fishing-Free-1.0.25-Android.apk`, 57,732,963 bytes; SHA-256 `D1AB20FADA929F5F9DF752B2EB979991337731E466566E532C74B0EEE9CB9176`. Package `com.fishingfree.game`; version 1.0.25/code 25; min API 24; target API 36. APK v2 signature, alignment, package metadata, 1.0.25 cache name, fallback code and six photos verified. Signer SHA-256 is `a6bcee7b761b12f3e85267f2579e9f3ec73609974d5fd0c8cb26dc37fb0507aa`. | Local debug signature is different from old Actions APKs. First install over an older signature may require uninstalling and may erase local save. The APK is not Play-signed. GitHub Actions still creates non-stable debug signatures; persistent signing secrets are not configured. |
| PWA / Pages | Local `npm run build` succeeded. The generated `dist/sw.js` has cache name `fishing-free-shell-1.0.25`; the compiled fallback is present. | 1.0.25 is not yet deployed. Public Pages is still on the 1.0.24 source until a push and successful Pages workflow. |
| Windows / Steam | The previous Windows 1.0.24 Actions candidate succeeded at startup/loopback packaging smoke. | A current 1.0.25 Windows candidate still needs to be built. No Steamworks App/depot IDs, SteamPipe upload, Steam-client test, approved store media or public release. |
| iOS | Xcode metadata is version 1.0.25/build 25, bundle `com.fishingfree.game`. | No iPhone-installable signed IPA: no Apple Developer membership, certificate or provisioning profile. |
| Ownership / license | GitHub repository `kidu89/tidewater` is owner-controlled and reports `fork: false`; game-facing name is Fishing Free. MIT license and third-party credits remain present. | Preserve original MIT copyright and asset notices; do not remove authorship statements. Repository slug still says `tidewater`. |
| Product / revenue | Current product audit retains free-base-game recommendation and test-first expansion. | No player retention, wishlist, conversion, sales or monetization data; no billing or ad SDK. |

## Key installation note

The previously installed emulator package is version 1.0.20/code 21 and is signed by a certificate different from the local 1.0.25 APK. I did not replace it, because doing so would remove the existing installation and can erase its save. The 1.0.25 APK uses this workstation's Android debug key; future local builds made here can keep that signer, while GitHub Actions debug builds may use another temporary key. A consistent Actions key would require storing the Android keystore and passwords as encrypted repository secrets. The automatic approval check rejected the attempted transfer of newly generated private signing material; nothing was transmitted or created. Do not treat this local candidate as a store release.
