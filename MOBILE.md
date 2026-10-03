# Fishing Free — Android and iOS build

The main island game keeps its original WebGPU 3D renderer. Android APKs run the version bundled with the app, so they include that release and can start offline. The app tries 3D first. If a native Android WebView returns no WebGPU adapter, Fishing Free now opens Scenic Fishing automatically so the player reaches the touch game instead of staying on a graphics error. Other browser launches retain the diagnostics and manual fallback button. Scenic Fishing uses actual 3D game captures and a touch fishing loop; it is a fallback, not realtime 3D.

## Requirements

- The latest published debug APK is [Actions run #17](https://github.com/kidu89/tidewater/actions/runs/37097701494), version 1.0.16 / code 17, package com.fishingfree.game, min API 24 and target API 36. Its 52.1 MB artifact passed CI package, signature and alignment checks, but it has not been installed on either the Samsung A52 or Huawei phone. The current local source changes are unpublished and are not inside that APK. Chrome documents WebGPU for Android 12+ on supported Qualcomm/ARM phones; Android 10/11 remain unverified. A green chrome://gpu row does not guarantee the game receives a usable adapter. See [Chrome's Android WebGPU announcement](https://developer.chrome.com/blog/new-in-webgpu-121/) and [Chrome's compatibility-mode notes](https://developer.chrome.com/blog/new-in-webgpu-146/).
- The game PWA can be added to the home screen from Safari on iOS. Apple's WebKit documents WebGPU in Safari 26, available on iOS 26. Older iOS/WKWebView releases may show the graphics compatibility screen until a supported WebGPU path is available. See [WebKit's WebGPU demos and support notes](https://webkit.org/demos/webgpu/).
- Android builds require Android Studio and its SDK. iOS builds and signing require macOS with Xcode.

### Install the high-fidelity mobile PWA

The PWA is deployed at [Fishing Free](https://kidu89.github.io/tidewater/). Open it in Chrome on Android or Safari on iOS and use the browser's **Install app** or **Add to Home Screen** menu. The 1.0.16 Android app opens the hosted page in Chrome on Android 10 and newer, bypassing Android System WebView; the first Chrome launch needs internet. The service worker caches the app shell and game assets after they load. First shader compilation may take time. On supported devices, the full 3D renderer starts after Chrome returns a usable WebGPU adapter. On Android 10, the current source explains that the phone is below Chrome's documented support floor; if graphics initialization fails, it displays a scenic error screen and device report instead of switching to the rejected 2D presentation. These startup changes are still local and unpublished.



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

## Latest Android APK from GitHub Actions

The latest verified Android artifact is [Actions run #17](https://github.com/kidu89/tidewater/actions/runs/37097701494), built from commit `415f418`: Fishing Free 1.0.16, version code 17, package `com.fishingfree.game`, min API 24 and target API 36. GitHub reports a 52.1 MB artifact with digest `sha256:8bca1fd0dd0a3e14bd92a02f375160b4ea4ee4f309a0583af9658e700082ce48`. CI verified the package ID, minimum API, APK signature and 4-byte alignment; no physical phone install or graphics test has been completed. This is a debug sideload APK, not a Play release.

To get the published APK: open the run link, download the Fishing-Free-Android-APK artifact, extract the ZIP, and use the .apk inside it. On Android 10+, the app opens the live web game in Chrome; Pages run [#73](https://github.com/kidu89/tidewater/actions/runs/37096939938) deployed commit 415f418. That published build predates the current local startup-screen change. It needs internet on first launch. Supported Android 12+ devices attempt full WebGPU 3D; Android 10 is below Chrome's documented support floor. A chrome://gpu acceleration row alone does not prove a WebGPU adapter can start.

GitHub debug APKs may be signed with a different temporary key on different workflow runs. Android may require uninstalling an older debug build before installing a differently signed one; uninstalling erases that app's local save. Back up the save before doing this if it matters.

For a signed Play release, choose `play-release` and add these repository secrets first:

- `ANDROID_KEYSTORE_BASE64`: base64-encoded Android upload keystore (`.jks` or `.keystore`).
- `ANDROID_KEYSTORE_PASSWORD`: keystore password.
- `ANDROID_KEY_ALIAS`: upload-key alias.
- `ANDROID_KEY_PASSWORD`: upload-key password.

Create the upload keystore in Android Studio with **Build → Generate Signed Bundle / APK → Android App Bundle → Create new**, then enroll the app in Play App Signing. Keep an offline backup and never commit the keystore or its passwords. The release workflow verifies the APK and AAB signatures, assigns a unique increasing version code, and removes the temporary keystore from the runner. The APK can be sideloaded; the AAB is the Play upload artifact. Debug-signed test installs cannot be updated by a differently signed release build and must be uninstalled first, which may clear their local save. If sideloaded release APKs must update seamlessly to the Play version, choose the matching app-signing-key option during Play App Signing enrollment; otherwise Play may sign installs with a different key. See [Android app signing](https://developer.android.com/studio/publish/app-signing). Play listing metadata, billing setup and owner submission remain separate release steps.

## Build a signed IPA with GitHub Actions

The workflow at `.github/workflows/ios-ipa.yml` uses a GitHub-hosted macOS runner with Xcode. Current local source metadata is app version **1.0.19**, build **20**, bundle ID `com.fishingfree.game`, and deployment target iOS 15. No signed IPA exists. The owner confirmed they have a personal Apple ID but no Apple Developer Program membership. Apple allows free-account testing on personal devices through Xcode on a Mac, but distributing through TestFlight or to registered devices requires program membership; Apple lists it at US$99 per year. Until then, the Safari PWA is the available iPhone install route. The workflow also requires these repository secrets before it can produce an installable IPA:

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
## Current local Android APK — Fishing Free 1.0.19 — 3 October 2026

[Download Fishing-Free-1.0.19-Android-debug-Scenic-Rescue.apk](release/1.0.19/android-debug-2026-10-03-rescue/Fishing-Free-1.0.19-Android-debug-Scenic-Rescue.apk) (57,732,502 bytes, SHA-256 `DF266789BDF4BC2BC6AD9D6149011A327B0D5CA184FA2EED83D2E391AD850773`). Package `com.fishingfree.game`, version 1.0.19 / code 20, minimum Android 7.0 (API 24), target API 36. Signature verification, 4-byte alignment and bundled scene assets were checked. Its local debug certificate matches the 1.0.18 APK, so this build can update 1.0.18 in place.

This build also fixes rescue-prompt priority: when swimming next to the boat, the existing board action stays available; harbor rescue appears when the player has moved away. The APK still starts the full 3D renderer first and offers Scenic Fishing if WebGPU cannot start. It was installed over the previous app and launched in an Android 16 x86_64 emulator: Scenic Fishing rendered its bundled scenes, casting triggered a fish bite, and SET HOOK entered the fishing fight UI. This is an emulator check only; the Samsung A52 has not been physically checked, so its WebGPU support and performance remain unverified. Screenshots: `release/1.0.19/android-emulator-check/`. It is a local debug sideload package, not a Play release. A signed iPhone IPA still requires Apple distribution signing that is not available on the owner's account.
## Current Android APK — Fishing Free 1.0.20 — 3 October 2026

[Download Fishing-Free-1.0.20-Android-Auto-Scenic.apk](release/Fishing-Free-1.0.20-Android-Auto-Scenic.apk) (57,732,514 bytes; SHA-256 `ADE78C50BAAE8358C25EA6A6A65ED071023073DACB5567D6C26700134FF4EEE0`). This is the exact APK from [GitHub Actions run #18](https://github.com/kidu89/tidewater/actions/runs/37130454722). Package `com.fishingfree.game`, version 1.0.20 / code 21, minimum API 24, target API 36. The Actions job verified its signature, alignment and package metadata.

The exact Actions APK was extracted, installed and launched in the Android 16 x86_64 emulator. When the native WebView could not start WebGPU, the app automatically opened Scenic Fishing; a touch cast and timely SET HOOK entered the fish-fight/tension state. Captures: `release/1.0.20/android-actions-run-18/emulator-auto-scenic.png` and `emulator-fish-fight.png`. This is emulator evidence only; the physical Samsung A52, MuMu Player and Huawei have not been tested. It is a debug sideload build, not a Play release. A separate local build is available at `release/1.0.20/android-debug-2026-10-03-auto-scenic/` (57,761,227 bytes; SHA-256 `7F69510759AE4A673AE56C4B0F04310CEB63738EAF78975BFC9ECA6C62769660`). The new source is live on Pages; [run #74](https://github.com/kidu89/tidewater/actions/runs/37130238004) completed successfully.
