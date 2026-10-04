# Fishing Free — release status

**Checked:** 4 October 2026. Current local source candidate: Fishing Free 1.0.27, Android code 27, iOS build 27. Version tags and GitHub Actions builds for 1.0.27 are pending publication from this workspace.

## Current evidence

| Area | Verified state | Remaining gap |
|---|---|---|
| Mobile startup | Android 12+ tries WebGPU with a 4.5-second adapter-probe cap, then opens bundled Scenic Fishing if no adapter is available. Android 10/11 open Scenic Fishing directly. The fallback uses high-resolution scene art and touch fishing; it is not real-time 3D. | 1.0.27 has not been installed on an emulator or physical phone. The Android 16 emulator evidence is for 1.0.26 and a separate `.validation` package. |
| Android APK | Local `release/1.0.27-android-local/Fishing-Free-1.0.27-Android.apk`, 57,732,097 bytes; SHA-256 `E88C201EC456838847B25A96DEB038939142F0BECAF2A86D6C20CEE5F5F42B33`. Package `com.fishingfree.game`, version 1.0.27/code 27, min API 24, target API 36. APK v2 signature and 4-byte alignment verified. Signer SHA-256 `a6bcee7b761b12f3e85267f2579e9f3ec73609974d5fd0c8cb26dc37fb0507aa`, matching the local 1.0.26 candidate. | Local debug signing is not a Play upload key. No physical Samsung A52 or Huawei installation has passed. The 1.0.27 Android Actions artifact is pending. |
| PWA / Pages | Previous deployed version 1.0.26 at [run 37158408850](https://github.com/kidu89/tidewater/actions/runs/37158408850). | 1.0.27 has not yet been deployed or checked from a physical phone browser. |
| Windows / Steam | Local Windows x64 package built for 1.0.27 in `release/win-unpacked`; 752 files, 450,745,028 bytes. `Fishing Free.exe` reports 1.0.27.0. | 1.0.27 Windows Actions artifact and clean retail-PC launch are pending. Package remains unsigned; no Steam App/depot IDs, store approval, SteamPipe upload, Steam overlay/controller or Steam Deck check. |
| iOS | Xcode Debug and Release App configurations now both use version 1.0.27/build 27, bundle `com.fishingfree.game`, deployment target iOS 15. | No signed installable IPA: the owner has no Apple Developer membership, certificate or provisioning profile. Safari PWA remains the iPhone route. |
| Ownership / license | Repo is `kidu89/tidewater`; game-facing name is Fishing Free. MIT license and third-party credits remain. | Preserve original MIT copyright and asset notices. |
| Product / revenue | The existing audit recommends a free base game and measured, test-first expansion. | No real-player retention, wishlist, conversion, sales or monetization data; no billing or ad SDK. |

## Install note

The local 1.0.27 APK uses the same debug signer as the local 1.0.26 APK and is structurally verified. The older 1.0.24 Actions APK has a different signer; Android may refuse an in-place update from it. Do not uninstall an existing install without backing up its local save. The 1.0.27 APK has not yet been installed on the owner's phones.

## Release gates still open

Physical Android installation/gameplay, 1.0.27 Actions artifacts, a signed Play release, signed iOS IPA, Steamworks IDs and SteamPipe upload remain outstanding. Monetization decisions still need player data.
