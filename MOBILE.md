# Fishing Free — Android and iOS build

Capacitor packages the game and its assets inside the app. The full 3D island uses WebGPU. If the phone's browser engine cannot provide a WebGPU adapter, the app starts an included touch-first fishing game rendered with Canvas 2D. Both modes use bundled local assets and run without a game website or an internet connection.

## Requirements

- Android API 24 or later can install the package. The full 3D mode requires a supported GPU and a WebView that exposes WebGPU; the OS version alone does not guarantee this. The included Canvas mode is selected automatically when WebGPU is missing.
- iOS builds run the same Canvas mode when WKWebView does not expose a usable WebGPU adapter, and use full 3D when one is available. The project targets iOS 15.0 with Capacitor 8.
- Android builds require Android Studio and its SDK. iOS builds and signing require macOS with Xcode.

The app checks whether WebGPU is available before loading the large 3D renderer. Phones without an adapter skip shader compilation and start the local Canvas fishing mode directly inside the app. This fallback is playable, but it is not visually equivalent to the full 3D game and still needs a higher-fidelity mobile renderer before the mobile release is considered ready. There is no browser redirect and no external game URL.

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

The current source version is **1.0.7** (Android version code **8**), package `com.fishingfree.game`, minimum API 24 and target API 36. The earlier [1.0.6 build](https://github.com/kidu89/tidewater/actions/runs/36871713285) is an old artifact; run **Actions → Build Fishing Free Android APK → Run workflow** on the latest pushed source and choose `debug-apk` to produce the 1.0.7 debug APK for sideloading and device checks. This is not a Play Store release artifact.

For a signed Play release, choose `play-release` and add these repository secrets first:

- `ANDROID_KEYSTORE_BASE64`: base64-encoded Android upload keystore (`.jks` or `.keystore`).
- `ANDROID_KEYSTORE_PASSWORD`: keystore password.
- `ANDROID_KEY_ALIAS`: upload-key alias.
- `ANDROID_KEY_PASSWORD`: upload-key password.

Create the upload keystore in Android Studio with **Build → Generate Signed Bundle / APK → Android App Bundle → Create new**, then enroll the app in Play App Signing. Keep an offline backup and never commit the keystore or its passwords. The release workflow verifies the APK and AAB signatures, assigns a unique increasing version code, and removes the temporary keystore from the runner. The APK can be sideloaded; the AAB is the Play upload artifact. Debug-signed test installs cannot be updated by a differently signed release build and must be uninstalled first, which may clear their local save. If sideloaded release APKs must update seamlessly to the Play version, choose the matching app-signing-key option during Play App Signing enrollment; otherwise Play may sign installs with a different key. See [Android app signing](https://developer.android.com/studio/publish/app-signing). Play listing metadata, billing setup and owner submission remain separate release steps.

## Build a signed IPA with GitHub Actions

The workflow at `.github/workflows/ios-ipa.yml` uses a GitHub-hosted macOS runner with Xcode. Xcode metadata is aligned to app version **1.0.7**, build **8**, bundle ID `com.fishingfree.game`, and deployment target iOS 15. No signed IPA exists yet. To produce one, add these repository secrets under **Settings → Secrets and variables → Actions** before running the workflow:

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

The full 3D mode gives touch devices a movement joystick, a drag-to-look region, and hold/tap buttons. The Canvas phone mode has a separate tap-and-hold fishing interface with five fishing areas, 22 catchable species, a fish logbook, a sellable cooler, rod upgrades, catch-card sharing, and local saves. The owner has reported unsatisfactory fallback graphics; treat visual parity and a real-device startup check on the Samsung A52 as open release blockers. Desktop keyboard, mouse and pointer-lock controls remain available in 3D mode.

Touch devices start 3D mode with a reduced rendering profile: 68% internal resolution, with volumetric clouds, caustics and the shoreline simulation disabled. Add `?fullQuality` to the app URL to opt back into the full desktop rendering profile. This is a starting point; tune it using real low-, mid- and high-end phones before release.

Game assets are packaged locally and saves remain in the app's local storage. The first run still compiles a large number of shaders, so measure cold-start time and memory use on devices with modest GPUs.
