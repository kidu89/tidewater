# Fishing Free — Android and iOS build

Capacitor packages the game and its assets inside the app. The full 3D island uses WebGPU. If the embedded phone WebView cannot provide a WebGPU adapter, the APK starts an included touch-first fishing game rendered with Canvas 2D. That fallback is playable but does not preserve the 3D visuals. The installable Fishing Free PWA is deployed and caches game files as they load. On Android 10 and newer, the APK opens it in Chrome so the full browser engine can try WebGPU; if Chrome cannot provide an adapter, the page starts the playable Canvas fallback.

## Requirements

- Android API 24 or later can install the APK. Starting with Android app version 1.0.14, Android 10+ launches the deployed PWA in Chrome; Android 10 is a best-effort path because Chrome's documented default WebGPU support starts at Android 12 on Qualcomm or ARM GPUs. A `chrome://gpu` entry saying “hardware accelerated” does not guarantee that this game can get a WebGPU adapter. If it cannot, the PWA starts the playable Canvas mode and **GRAPHICS INFO** shows the adapter attempts. The Samsung A52 on Android 12 remains the intended full 3D validation target. See [Chrome's Android WebGPU announcement](https://developer.chrome.com/blog/new-in-webgpu-121/).
- The game PWA can be added to the home screen from Safari on iOS. Apple's WebKit documents WebGPU in Safari 26, available on iOS 26; older iOS/WKWebView releases may use the Canvas fallback. See [WebKit's WebGPU demos and support notes](https://webkit.org/demos/webgpu/).
- Android builds require Android Studio and its SDK. iOS builds and signing require macOS with Xcode.

### Install the high-fidelity mobile PWA

The PWA is deployed at [Fishing Free](https://kidu89.github.io/tidewater/). Open the link in Chrome on Android or Safari on iOS and use that browser's **Install app** or **Add to Home Screen** menu. Android app version 1.0.14 opens this page in Chrome on Android 10 and newer, bypassing Android System WebView; if Chrome is unavailable it keeps the bundled game. The first Chrome launch needs internet. Let the page finish loading; the service worker caches the app shell and game assets for later launches. The first shader compilation may still take time. On iOS, full 3D requires Safari/WebKit 26 or newer with WebGPU available. If the page shows Canvas mode, its browser engine or GPU did not provide a usable adapter; **GRAPHICS INFO** reports the reason.

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

Android version **1.0.14** (version code **15**), package `com.fishingfree.game`, minimum API 24 and target API 36, built successfully in [Actions run 36913925368](https://github.com/kidu89/tidewater/actions/runs/36913925368). Download its `Fishing-Free-Android-APK` artifact (52.1 MB; digest `sha256:843c5e932b80176b1741582e9dec8a1983d9ab8633bb05aefe453a316793ad22`), extract `app-debug.apk` from the downloaded ZIP, then send that APK to the phone. Before upload, CI passed ZIP integrity, APK signature, 4-byte alignment, package ID `com.fishingfree.game`, version code/name and minimum-API checks. Android 10+ launches the deployed game in Chrome; the first launch needs internet, and Android 10 WebGPU is best-effort. No physical install or gameplay check has yet been completed on the Huawei Android 10 device or Samsung A52. This is a debug-signed device-check build, not a Play Store release. A different debug key may prevent installing over an earlier test build, so uninstalling it first may be required and can erase the local save.

For a signed Play release, choose `play-release` and add these repository secrets first:

- `ANDROID_KEYSTORE_BASE64`: base64-encoded Android upload keystore (`.jks` or `.keystore`).
- `ANDROID_KEYSTORE_PASSWORD`: keystore password.
- `ANDROID_KEY_ALIAS`: upload-key alias.
- `ANDROID_KEY_PASSWORD`: upload-key password.

Create the upload keystore in Android Studio with **Build → Generate Signed Bundle / APK → Android App Bundle → Create new**, then enroll the app in Play App Signing. Keep an offline backup and never commit the keystore or its passwords. The release workflow verifies the APK and AAB signatures, assigns a unique increasing version code, and removes the temporary keystore from the runner. The APK can be sideloaded; the AAB is the Play upload artifact. Debug-signed test installs cannot be updated by a differently signed release build and must be uninstalled first, which may clear their local save. If sideloaded release APKs must update seamlessly to the Play version, choose the matching app-signing-key option during Play App Signing enrollment; otherwise Play may sign installs with a different key. See [Android app signing](https://developer.android.com/studio/publish/app-signing). Play listing metadata, billing setup and owner submission remain separate release steps.

## Build a signed IPA with GitHub Actions

The workflow at `.github/workflows/ios-ipa.yml` uses a GitHub-hosted macOS runner with Xcode. Source metadata is now app version **1.0.13**, build **14**, bundle ID `com.fishingfree.game`, and deployment target iOS 15. No signed IPA exists yet. To produce one, add these repository secrets under **Settings → Secrets and variables → Actions** before running the workflow:

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

The full 3D mode gives touch devices a movement joystick, a drag-to-look region, and hold/tap buttons. The Canvas phone mode has a separate tap-and-hold fishing interface with five fishing areas, 22 catchable species, a fish logbook, a sellable cooler, rod upgrades, catch-card sharing, and local saves. When it starts, **GRAPHICS INFO** displays the detected OS/WebView engine, secure-context status, WebGPU API state, adapter attempts, and fallback reason; the report stays local unless the player copies and sends it. This diagnostic does not improve fallback graphics. The owner has reported unsatisfactory fallback visuals; treat visual parity and a real-device startup check on the Samsung A52 as open release blockers. Desktop keyboard, mouse and pointer-lock controls remain available in 3D mode.

Touch devices start 3D mode with a reduced rendering profile: 68% internal resolution, with volumetric clouds, caustics and the shoreline simulation disabled. Add `?fullQuality` to the app URL to opt back into the full desktop rendering profile. This is a starting point; tune it using real low-, mid- and high-end phones before release.

Game assets are packaged locally and saves remain in the app's local storage. The first run still compiles a large number of shaders, so measure cold-start time and memory use on devices with modest GPUs.

