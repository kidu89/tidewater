# Fishing Free — release status

**Checked:** 4 October 2026. Commit `036790da6ceb2e3ebc85665bf093177c9a3db44c` is on `main` in `kidu89/tidewater`; release tags `android-v1.0.26` and `desktop-v1.0.26` point to that commit. App metadata is Fishing Free 1.0.26, Android code 26 and iOS build 26.

## Current evidence

| Area | Verified state | Remaining gap |
|---|---|---|
| Mobile startup | Android 10/11 now opens Scenic Fishing directly. Android 12+ tries WebGPU, then starts the bundled scenic mode if adapter creation fails. The scenic fallback uses high-resolution beach artwork and touch fishing; it is not real-time 3D. The Android 16 emulator showed the fallback and touch controls after WebView WebGPU initialization failed. | No physical Samsung A52 or Huawei test. The emulator test used a separate `.validation` app ID; the existing 1.0.20 installation and data were left intact. |
| Local Android APK | `release/1.0.26-android-local/Fishing-Free-1.0.26-Android.apk`, 57,759,281 bytes; SHA-256 `199A1B715B08FFD05C6D15411CDD6010B37F8CAA1E55750E86750C45FCD7EAED`. Package `com.fishingfree.game`; version 1.0.26/code 26; min API 24; target API 36. APK v2 signature and 4-byte alignment verified. Signer SHA-256: `a6bcee7b761b12f3e85267f2579e9f3ec73609974d5fd0c8cb26dc37fb0507aa`. | Local debug signature is not a Play signing key. An install signed with a different certificate may require uninstalling the old app, which can erase its save. |
| Android Actions | [Run 37158444814](https://github.com/kidu89/tidewater/actions/runs/37158444814) succeeded; CI verified and uploaded `Fishing-Free-Android-APK`. Artifact ZIP size 57,065,366 bytes; digest `sha256:0df2418732ad01192b5f4a758c12fc932aa444dd820baaf40068b739ea5611a3`; retained until 17 October 2026. | Actions debug signing is not configured with a stable owner key. Its APK may not update an install signed by the local workstation key. |
| PWA / Pages | [Run 37158408850](https://github.com/kidu89/tidewater/actions/runs/37158408850) deployed successfully. The live HTML and service worker return HTTP 200; the service worker cache is `fishing-free-shell-1.0.26`. | No physical phone browser run. |
| Windows / Steam | [Run 37158444500](https://github.com/kidu89/tidewater/actions/runs/37158444500) passed executable existence and staged startup/loopback smoke checks. Artifact `Fishing-Free-Windows-x64`: 214,624,947 bytes; digest `sha256:4c0b01c5cad706c969e333fa43e831ae1576519b3fb892e348e758ec0bff6e42`; retained until 17 October 2026. | This is not a Steam release. Steamworks App/depot IDs, final approved store art/media, SteamPipe upload and Steam-client/controller checks are outstanding. |
| iOS | Xcode metadata is version 1.0.26/build 26, bundle `com.fishingfree.game`, deployment target iOS 15. | No signed installable IPA: the owner has no Apple Developer Program membership, certificate or provisioning profile. Safari PWA remains the iPhone route. |
| Ownership / license | Repo is `kidu89/tidewater`; game-facing name is Fishing Free. MIT license and third-party credits remain. | Preserve original MIT copyright and asset notices. |
| Product / revenue | Existing audit recommends a free base game and measured, test-first expansion. | No real player retention, wishlist, conversion, sales or monetization data; no billing or ad SDK. |

## Install note

Use the standalone local APK above, not the Actions artifact ZIP. The local APK was verified as package `com.fishingfree.game`, version code 26. If Android reports a signature conflict while updating an older install, uninstalling that install may erase its local save. The local APK uses this workstation's debug key; the GitHub Actions artifact can use another debug key.

## Release gates still open

No physical Android device has confirmed installation and gameplay. Stable Android release signing and Play Console submission are not configured. There is no signed iOS IPA, Steamworks app/depot setup or SteamPipe upload. Monetization decisions still need player data.
