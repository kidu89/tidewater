# Fishing Free — Android and iOS build

Capacitor packages the game and its assets inside the app. The full 3D island uses WebGPU. If the embedded phone WebView cannot provide a WebGPU adapter, the APK starts an included touch-first fishing game rendered with Canvas 2D. That fallback is playable but does not preserve the 3D visuals. For phones where the browser supports WebGPU but its embedded WebView does not, Fishing Free is also being prepared as an installable web app (PWA) that runs in the full browser engine and caches files for later offline launches.

## Requirements

- Android API 24 or later can install the APK. Chrome documents WebGPU on Android 12+ with Qualcomm or ARM GPUs from Chrome 121. The embedded System WebView can have different support, so the bundled APK may still choose Canvas mode. The PWA route uses Chrome itself on Android and is the preferred high-fidelity path on supported phones. Android 10, as shown on the Huawei device report, is below Chrome's documented Android 12 WebGPU support; do not expect the 3D renderer there. See [Chrome's Android WebGPU announcement](https://developer.chrome.com/blog/new-in-webgpu-121/).
- The game PWA can be added to the home screen from Safari on iOS. Apple's WebKit documents WebGPU in Safari 26, available on iOS 26; older iOS/WKWebView releases may use the Canvas fallback. See [WebKit's WebGPU demos and support notes](https://webkit.org/demos/webgpu/).
- Android builds require Android Studio and its SDK. iOS builds and signing require macOS with Xcode.

### Install the high-fidelity mobile PWA

The PWA is deployed at [Fishing Free](https://kidu89.github.io/tidewater/). Open the link in Chrome on Android or Safari on iOS and use that browser's **Install app** or **Add to Home Screen** menu. The 1.0.13 Android APK source also opens this page in Chrome on Android 12+, bypassing the embedded WebView; if Chrome is unavailable it keeps the bundled game. On Android 12+ this needs internet for the first launch. Let the first load finish while online; the version 1.0.13 service worker cache refreshes the app shell and game assets as they load, allowing later offline launches. The first shader compilation may still take time. On iOS, full 3D requires Safari/WebKit 26 or newer with WebGPU available. If the installed app shows Canvas mode, its browser engine or GPU did not provide a usable adapter; **GRAPHICS INFO** reports the reason.

On Android versions before 12, the APK remains fully bundled and starts the local Canvas mode because Chrome's documented WebGPU support does not cover those versions. That fallback is playable but is not visually equivalent to 3D, so do not use it to claim visual parity on Android 10 or other unsupported browser/GPU combinations.

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

Android version **1.0.13** (version code **14**), package `com.fishingfree.game`, minimum API 24 and target API 36, built successfully in [Actions run 36911231911](https://github.com/kidu89/tidewater/actions/runs/36911231911). Download its `Fishing-Free-Android-APK` artifact (52.1 MB; digest `sha256:7f1fbc3d42d5890e7410a175fe19e1fdf1a929a0c21def542aef803c5ba1d4ed`), extract `app-debug.apk` from the downloaded ZIP, then send that APK to the phone. Before upload, CI passed ZIP integrity, APK signature, 4-byte alignment, package ID, version and minimum-API checks. The APK has not been installed or gameplay-checked on the Samsung A52. On Android 12+, it opens the deployed game in Chrome; first launch requires internet, then the PWA cache can support later offline launches. The artifact is debug-signed for device checks, not a Play Store release. Because each GitHub-hosted debug build may use a different debug signing key, installing over a previous debug APK may require uninstalling the old app first; that can erase the local save.

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

