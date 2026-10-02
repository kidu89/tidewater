# Fishing Free — Android and iOS build

Capacitor packages the game and its assets inside the app. The full 3D island uses WebGPU. If the embedded phone WebView cannot provide a WebGPU adapter, the APK starts an included touch-first fishing game rendered with Canvas 2D. That fallback is playable but does not preserve the 3D visuals. The installable Fishing Free PWA is deployed and caches game files as they load. On Android 10 and newer, the APK opens it in Chrome so the full browser engine can try WebGPU; if Chrome cannot provide an adapter, the page starts the playable Canvas fallback.

## Requirements

- Android API 24 or later can install the APK. The local 1.0.15 Android build opens the deployed PWA in Chrome on Android 10+. The web update is deployed with cache version 1.0.15. On Android 10/11, the adapter probe tries Chrome's OpenGL ES compatibility mode first and allows up to 4.5 seconds for each compatibility attempt, within a 10-second total search window. Android 12+ still tries core WebGPU first. This is best-effort and has not been verified on the Huawei or Samsung A52. A `chrome://gpu` entry saying “hardware accelerated” does not guarantee the game can get a usable adapter or device. If it cannot, the PWA starts the Canvas mode and **GRAPHICS INFO** shows the adapter attempts. See [Chrome's Android WebGPU announcement](https://developer.chrome.com/blog/new-in-webgpu-121/) and [Chrome's compatibility-mode notes](https://developer.chrome.com/blog/new-in-webgpu-146/).
- The game PWA can be added to the home screen from Safari on iOS. Apple's WebKit documents WebGPU in Safari 26, available on iOS 26; older iOS/WKWebView releases may use the Canvas fallback. See [WebKit's WebGPU demos and support notes](https://webkit.org/demos/webgpu/).
- Android builds require Android Studio and its SDK. iOS builds and signing require macOS with Xcode.

### Install the high-fidelity mobile PWA

The PWA is deployed at [Fishing Free](https://kidu89.github.io/tidewater/). Open the link in Chrome on Android or Safari on iOS and use that browser's **Install app** or **Add to Home Screen** menu. Android app version 1.0.15 opens this page in Chrome on Android 10 and newer, bypassing Android System WebView; if Chrome is unavailable it keeps the bundled game. The first Chrome launch needs internet. Let the page finish loading; the service worker caches the app shell and game assets for later launches. The first shader compilation may still take time. On iOS, full 3D requires Safari/WebKit 26 or newer with WebGPU available. If the page shows Canvas mode, its browser engine or GPU did not provide a usable adapter; **GRAPHICS INFO** reports the reason.

On Android 10 and 11, the APK tries Chrome and WebGPU but does not guarantee 3D; on devices below Android 10, or when Chrome is unavailable, the APK keeps the bundled offline Canvas mode. Canvas mode is playable but is not visually equivalent to the 3D game.

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

## Build an Android APK with GitHub Actions

The local 1.0.15 Android release candidate (version code 16; package `com.fishingfree.game`; min API 24; target API 36) is 55,259,498 bytes with SHA-256 `003711E4E43AF7E1B8FC6A017996BCD10398888968EA11041A0A333EE435BE0C`. Signature v2, 4-byte alignment and manifest checks pass. It installed and launched on an Android 16 x86_64 emulator; Chrome displayed its first-run screen. No physical Samsung A52 or Huawei gameplay check has been completed. This is a debug-signed test APK, not a Play Store release. The remote Actions artifact is still 1.0.14 until a 1.0.15 tag build completes. A different debug key may require uninstalling an older build first, which can erase its local save.

For a signed Play release, choose `play-release` and add these repository secrets first:

- `ANDROID_KEYSTORE_BASE64`: base64-encoded Android upload keystore (`.jks` or `.keystore`).
- `ANDROID_KEYSTORE_PASSWORD`: keystore password.
- `ANDROID_KEY_ALIAS`: upload-key alias.
- `ANDROID_KEY_PASSWORD`: upload-key password.

Create the upload keystore in Android Studio with **Build → Generate Signed Bundle / APK → Android App Bundle → Create new**, then enroll the app in Play App Signing. Keep an offline backup and never commit the keystore or its passwords. The release workflow verifies the APK and AAB signatures, assigns a unique increasing version code, and removes the temporary keystore from the runner. The APK can be sideloaded; the AAB is the Play upload artifact. Debug-signed test installs cannot be updated by a differently signed release build and must be uninstalled first, which may clear their local save. If sideloaded release APKs must update seamlessly to the Play version, choose the matching app-signing-key option during Play App Signing enrollment; otherwise Play may sign installs with a different key. See [Android app signing](https://developer.android.com/studio/publish/app-signing). Play listing metadata, billing setup and owner submission remain separate release steps.

## Build a signed IPA with GitHub Actions

The workflow at `.github/workflows/ios-ipa.yml` uses a GitHub-hosted macOS runner with Xcode. Local source metadata is app version **1.0.15**, build **16**, bundle ID `com.fishingfree.game`, and deployment target iOS 15. No signed IPA exists. The owner confirmed they have a personal Apple ID but no Apple Developer Program membership. Apple allows free-account testing on personal devices through Xcode on a Mac, but distributing through TestFlight or to registered devices requires program membership; Apple lists it at US$99 per year. Until then, the Safari PWA is the available iPhone install route. The workflow also requires these repository secrets before it can produce an installable IPA:

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

The full 3D mode gives touch devices a movement joystick, a drag-to-look region, and hold/tap buttons. The Canvas phone mode has a separate tap-and-hold fishing interface with five fishing areas, 23 catchable species, a fish logbook, a sellable cooler, rod upgrades, catch-card sharing, and local saves. When it starts, **GRAPHICS INFO** displays the detected OS/WebView engine, secure-context status, WebGPU API state, adapter attempts, and fallback reason; the report stays local unless the player copies and sends it. This diagnostic does not improve fallback graphics. The owner has reported unsatisfactory fallback visuals; treat visual parity and a real-device startup check on the Samsung A52 as open release blockers. Desktop keyboard, mouse and pointer-lock controls remain available in 3D mode.

Touch devices start 3D mode with a reduced rendering profile: 68% internal resolution, with volumetric clouds, caustics and the shoreline simulation disabled. Add `?fullQuality` to the app URL to opt back into the full desktop rendering profile. This is a starting point; tune it using real low-, mid- and high-end phones before release.

Game assets are packaged locally and saves remain in the app's local storage. The first run still compiles a large number of shaders, so measure cold-start time and memory use on devices with modest GPUs.
