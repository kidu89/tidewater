# Fishing Free — Android and iOS build

Fishing Free keeps its original WebGPU 3D world on devices that support it. Android 12 and newer try WebGPU for up to 4.5 seconds, then open Scenic Fishing if no usable adapter is available; Android 10 and 11 go straight to Scenic Fishing. The touch fallback uses high-resolution scenes captured from the game, not real-time 3D. APKs display their version in the game and clear the game's old service-worker cache on startup; browser PWA caching stays on. Desktop retains the full renderer.

## Current source — Fishing Free 1.0.30 (4 October 2026)

- Added export and restore for Scenic Fishing progress and any saved 3D career. The JSON backup is validated before import; restore asks before replacing matching saves and rolls storage back if writing fails.
- Production web build and Capacitor Android sync succeeded. Android metadata is version 1.0.30/code 30, package com.fishingfree.game, minimum API 24, target API 36.
- GitHub Actions Android run #27 succeeded from commit 462daa9. The downloadable artifact is 57,069,866 bytes, SHA-256 sha256:01547f3a1bf93cb527256d4c9ce416ba852f6b6c313b702dfa99eaa34c16c3b6; it expires 18 October 2026. Open https://github.com/kidu89/tidewater/actions/runs/37177877720 and download Fishing-Free-Android-APK.
- Android package: com.fishingfree.game, version 1.0.30/code 30, minimum API 24, target API 36. The local APK build could not run because this PC has no Android SDK configured; the Actions artifact is the current package.
- The native iOS project is version 1.0.30/build 30. Simulator run #9 succeeded, but its unsigned simulator app cannot install on iPhone. The owner has a personal Apple ID but no Developer Program membership or signing assets, so a signed IPA cannot be produced.

## Previous verified Android candidate — Fishing Free 1.0.29 (4 October 2026)

- Local debug APK: `release/1.0.29-android-local/Fishing-Free-1.0.29-Android.apk` (57,761,153 bytes; SHA-256 `2409BC064353A00BBF36C89064D5676788379AE87AF08F5186A5E416679DBA29`).
- Package `com.fishingfree.game`, version 1.0.29 / code 29, minimum API 24, target API 36. APK v2 signature and 4-byte alignment verified. Local signer SHA-256 `a6bcee7b761b12f3e85267f2579e9f3ec73609974d5fd0c8cb26dc37fb0507aa`; it matches the prior local 1.0.28 build. This is a debug sideload build, not a Play release.
- Installed over 1.0.28 on an Android 16 x86_64 emulator: Scenic displayed the weekly objective card, accepted a cast and showed a fish bite. Full catch/claim and physical phone, MuMu Player, Huawei ELE-L29 and WebGPU 3D checks remain open.
- GitHub Actions [run #26](https://github.com/kidu89/tidewater/actions/runs/37172317923) succeeded for 1.0.29 and uploaded artifact Fishing-Free-Android-APK (57,066,910 bytes; archive digest `sha256:cb9b68b2ebc30496146ff71fd523c1579725cc78edac6e01f4305eef30b7385f`).
- Android source commit 771ab24 and tag android-v1.0.29 are pushed. Android Actions run #26 passed; Windows Steam package run #27, Pages run #100 and iOS Simulator run #7 also succeeded for the 1.0.29 source.

## Requirements

- The latest Android sideload package is the 1.0.30 GitHub Actions artifact above. The older local 1.0.29 APK remains only as a previous device-check candidate; Actions debug signing can differ between builds.
- Safari on iOS can install the PWA. Native iOS metadata is 1.0.30/build 30. Simulator run #9 built successfully, but its unsigned app cannot install on iPhone; no signed IPA exists without Apple Developer signing assets.
- Android builds require Android Studio and its SDK. Native iOS builds require macOS with Xcode.

### Install on a phone with the PWA

The PWA is deployed at [Fishing Free](https://kidu89.github.io/tidewater/) at version 1.0.30 ([Pages run #102](https://github.com/kidu89/tidewater/actions/runs/37177858643)). Open it in Chrome on Android or Safari on iOS and use **Install app** or **Add to Home Screen**. Supported devices start the full 3D renderer; if WebGPU fails, the source opens Scenic Fishing automatically. The PWA needs internet on first load, then the service worker caches the app shell and game assets. Native APKs bundle assets and run offline; they remove old game service-worker caches so app updates use the assets shipped in the APK.

## Create native projects

Install dependencies, then add the platform project you want:

```sh
npm ci
npm run mobile:add:android
npm run mobile:sync:android
npx cap open android
```

For iOS, run these commands on a Mac with Xcode installed:

```sh
npm ci
npm run mobile:add:ios
npm run mobile:sync:ios
npx cap open ios
```

## Previous GitHub Actions Android APK — 1.0.24

The previous GitHub Actions Android artifact is [Actions run #22](https://github.com/kidu89/tidewater/actions/runs/37150115502), built from commit `3b680b2`: Fishing Free 1.0.24, version code 24, package `com.fishingfree.game`, min API 24 and target API 36. The standalone APK is 57,732,890 bytes, SHA-256 `376DC48B2DAE80A091A5568B4DD615D63C24BE8B6F2124DEAF031A886187B16A`; it is debug-signed, not a Play release. CI and local checks verified the APK signature and alignment, and its bundled JavaScript contains automatic mobile fallback. No physical phone has been checked.

The 1.0.24 APK is historical. Use the 1.0.30 Actions artifact listed above. The artifact is a ZIP downloaded from the Actions run; extract the APK before transferring it to the phone. Actions debug signing can differ from a locally signed install, so Android may ask to remove the older app first. Removing the app erases its local progress; the older app has no save-export tool.

GitHub debug APKs may be signed with a different temporary key on different workflow runs. Android may require uninstalling an older debug build before installing a differently signed one; uninstalling erases that app's local save. Back up the save before doing this if it matters.

For a signed Play release, choose `play-release` and add these repository secrets first:

- `ANDROID_KEYSTORE_BASE64`: base64-encoded Android upload keystore (`.jks` or `.keystore`).
- `ANDROID_KEYSTORE_PASSWORD`: keystore password.
- `ANDROID_KEY_ALIAS`: upload-key alias.
- `ANDROID_KEY_PASSWORD`: upload-key password.

Create the upload keystore in Android Studio with **Build → Generate Signed Bundle / APK → Android App Bundle → Create new**, then enroll the app in Play App Signing. Keep an offline backup and never commit the keystore or its passwords. The release workflow verifies the APK and AAB signatures, assigns a unique increasing version code, and removes the temporary keystore from the runner. The APK can be sideloaded; the AAB is the Play upload artifact. Debug-signed test installs cannot be updated by a differently signed release build and must be uninstalled first, which may clear their local save. If sideloaded release APKs must update seamlessly to the Play version, choose the matching app-signing-key option during Play App Signing enrollment; otherwise Play may sign installs with a different key. See [Android app signing](https://developer.android.com/studio/publish/app-signing). Play listing metadata, billing setup and owner submission remain separate release steps.

## Build a signed IPA with GitHub Actions

The workflow at `.github/workflows/ios-ipa.yml` uses a GitHub-hosted macOS runner with Xcode. Current source metadata is app version **1.0.30**, build **30**, bundle ID `com.fishingfree.game`, and deployment target iOS 15. The unsigned Simulator workflow now runs on pushes to `main` and passed for 1.0.30 in [run #9](https://github.com/kidu89/tidewater/actions/runs/37177858656). It is not an iPhone-installable build. No signed IPA exists. The owner confirmed they have a personal Apple ID but no Apple Developer Program membership. Apple allows free-account testing on personal devices through Xcode on a Mac, but distributing through TestFlight or to registered devices requires program membership. Until then, the Safari PWA is the available iPhone install route. The workflow also requires these repository secrets before it can produce an installable IPA:

- `IOS_TEAM_ID`: the Apple Developer team ID.
- `IOS_CERTIFICATE_P12_BASE64`: base64-encoded Apple Distribution certificate and private key exported as a password-protected P12.
- `IOS_CERTIFICATE_PASSWORD`: the P12 export password.
- `IOS_PROVISIONING_PROFILE_BASE64`: base64-encoded provisioning profile for `com.fishingfree.game`, from the same team.

After the secrets exist, pushing this source to branch `release/ios-ipa` starts an ad-hoc build automatically. You can also open **Actions → Build Fishing Free iOS IPA → Run workflow** and choose a distribution:

- `ad-hoc`: the profile must include the iPhone or iPads that will install the app.
- `app-store-connect`: exports an App Store Connect IPA for later upload to TestFlight or App Store Connect.

The resulting IPA is attached to the workflow run as the `Fishing-Free-iOS-…` artifact. Keep signing files and passwords in GitHub secrets; do not commit them or paste them into chat.

After changing web code, run the matching `mobile:sync:*` command again. Keep the Android package minimum at API 24. The iOS Xcode project currently targets iOS 15.0, the minimum supported by Capacitor 8.

For shared catch cards and friend challenges, set `VITE_PUBLIC_GAME_URL` to a public game or store landing page when building a release. Native builds do not add a default website link to shared catches.

## Mobile controls and performance

The full 3D mode gives touch devices a movement joystick, a drag-to-look region, and hold/tap buttons. When WebGPU initialization fails, the scenic screen reports the detected Android version, browser, adapter attempts and startup reason. DEVICE DETAILS expands the report, COPY REPORT copies it locally, and TRY AGAIN reloads the game. This is diagnostic behavior, not proof that mobile 3D works. The Samsung A52 still needs a physical launch and gameplay check. Desktop keyboard, mouse and pointer-lock controls remain available in 3D mode.

Touch devices start 3D mode with a reduced rendering profile: 68% internal resolution, with volumetric clouds, caustics and the shoreline simulation disabled. Add `?fullQuality` to the app URL to opt back into the full desktop rendering profile. This is a starting point; tune it using real low-, mid- and high-end phones before release.

Game assets are packaged locally and saves remain in the app's local storage. The first run still compiles a large number of shaders, so measure cold-start time and memory use on devices with modest GPUs.

## Earlier local Android build (1.0.17) — historical

Fishing Free 1.0.17 added Sunspire Atoll and the black grouper. The 1.0.17 local APK was built before Android was switched to bundled assets; it still opened the hosted 1.0.16 page. This older APK did not include the local Atoll update and could not resolve a failed WebGPU launch. It was not physically installed or verified. The current 1.0.18 local APK below supersedes it for testing.
## Local Android build generated on 3 October 2026

A debug APK was built locally from the 1.0.17 working tree: [Fishing-Free-1.0.17-Android-debug.apk](release/1.0.17/android-debug-2026-10-03-1324/Fishing-Free-1.0.17-Android-debug.apk), 55,252,821 bytes, SHA-256 `9B104AB1B266DFEB1B5150E44360E0986178CC71C3A21D4F3C63EE15A4784E82`. Package checks passed for `com.fishingfree.game`, version code 18, min API 24, target API 36, debug signature and 4-byte alignment. This is not a published APK or Play release. The launcher still opens the hosted PWA, whose published source is 1.0.16; this APK therefore does not include the local Sunspire update and does not fix a phone that gets “No WebGPU adapter found.” No physical device was connected during this build.

## Previous local Android APK — 3 October 2026, version 1.0.18

[Download Fishing-Free-1.0.18-Android-debug-Scenic.apk](release/1.0.18/android-debug-2026-10-03-scenic/Fishing-Free-1.0.18-Android-debug-Scenic.apk) (57,732,486 bytes, SHA-256 `A8E3E3A46BC7B2E34B91B880D2F8446CD4BDDF420311225B3A3BEE59DC9AB3DB`). Package `com.fishingfree.game`, version 1.0.18 / code 19, minimum Android 7.0 (API 24), target API 36. The APK has a verified local debug signature and correct 4-byte alignment. The local 1.0.17 APK uses the same debug signing certificate, so Android can update it in place. Builds obtained from a different signing key may require removing that earlier app first.

Unlike the earlier APK, this version opens the game assets bundled in the app, so the build is version-matched and works without fetching the website. It tries the original WebGPU 3D renderer first. If WebGPU cannot start, choose **PLAY SCENIC FISHING** on the error screen. That mode keeps fishing and progression playable over six real 1920×1080 scenes captured from the game's 3D world, with slow ambient motion. The scenes are compressed to WebP and total about 2.4 MB. Scenic Fishing is a touch-first alternative; it is not the full realtime 3D renderer.

The APK has not been installed on the Samsung A52 or the Huawei phone. Package checks cannot verify Android WebView's WebGPU adapter or on-device gameplay. This is a sideloadable debug build, not a Play Store release. No signed, phone-installable iOS IPA can be produced with the available personal Apple ID alone; the iPhone option remains Safari/PWA until there is a Mac/signing path or Apple Developer distribution membership.
## Historical local Android APK — Fishing Free 1.0.19 — 3 October 2026

[Download Fishing-Free-1.0.19-Android-debug-Scenic-Rescue.apk](release/1.0.19/android-debug-2026-10-03-rescue/Fishing-Free-1.0.19-Android-debug-Scenic-Rescue.apk) (57,732,502 bytes, SHA-256 `DF266789BDF4BC2BC6AD9D6149011A327B0D5CA184FA2EED83D2E391AD850773`). Package `com.fishingfree.game`, version 1.0.19 / code 20, minimum Android 7.0 (API 24), target API 36. Signature verification, 4-byte alignment and bundled scene assets were checked. Its local debug certificate matches the 1.0.18 APK, so this build can update 1.0.18 in place.

This build also fixes rescue-prompt priority: when swimming next to the boat, the existing board action stays available; harbor rescue appears when the player has moved away. The APK still starts the full 3D renderer first and offers Scenic Fishing if WebGPU cannot start. It was installed over the previous app and launched in an Android 16 x86_64 emulator: Scenic Fishing rendered its bundled scenes, casting triggered a fish bite, and SET HOOK entered the fishing fight UI. This is an emulator check only; the Samsung A52 has not been physically checked, so its WebGPU support and performance remain unverified. Screenshots: `release/1.0.19/android-emulator-check/`. It is a local debug sideload package, not a Play release. A signed iPhone IPA still requires Apple distribution signing that is not available on the owner's account.
## Historical Android APK — Fishing Free 1.0.20 — 3 October 2026

[Download Fishing-Free-1.0.20-Android-Auto-Scenic.apk](release/Fishing-Free-1.0.20-Android-Auto-Scenic.apk) (57,732,514 bytes; SHA-256 `ADE78C50BAAE8358C25EA6A6A65ED071023073DACB5567D6C26700134FF4EEE0`). This is the exact APK from [GitHub Actions run #18](https://github.com/kidu89/tidewater/actions/runs/37130454722). Package `com.fishingfree.game`, version 1.0.20 / code 21, minimum API 24, target API 36. The Actions job verified its signature, alignment and package metadata.

The exact Actions APK was extracted, installed and launched in the Android 16 x86_64 emulator. When the native WebView could not start WebGPU, the app automatically opened Scenic Fishing; a touch cast and timely SET HOOK entered the fish-fight/tension state. Captures: `release/1.0.20/android-actions-run-18/emulator-auto-scenic.png` and `emulator-fish-fight.png`. This is emulator evidence only; the physical Samsung A52, MuMu Player and Huawei have not been tested. It is a debug sideload build, not a Play release. A separate local build is available at `release/1.0.20/android-debug-2026-10-03-auto-scenic/` (57,761,227 bytes; SHA-256 `7F69510759AE4A673AE56C4B0F04310CEB63738EAF78975BFC9ECA6C62769660`). The new source is live on Pages; [run #74](https://github.com/kidu89/tidewater/actions/runs/37130238004) completed successfully.
