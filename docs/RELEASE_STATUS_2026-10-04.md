# Fishing Free — release status

**Checked:** 4 October 2026. Fishing Free 1.0.27, Android code 27, iOS build 27. Release commit `498f7a3aebc7d798a99c823ae71e50fddb04a7b7` is on `main`; `android-v1.0.27` and `desktop-v1.0.27` point to it.

## Current evidence

| Area | Verified state | Remaining gap |
|---|---|---|
| Mobile startup | Android 12+ tries WebGPU with a 4.5-second adapter-probe cap, then opens bundled Scenic Fishing if no adapter is available. Android 10/11 open Scenic Fishing directly. The fallback uses high-resolution scene art and touch fishing; it is not real-time 3D. | 1.0.27 has not been installed on an emulator or physical phone. The Android 16 emulator evidence is for 1.0.26 and a separate `.validation` package. |
| Android APK | Local APK `release/1.0.27-android-local/Fishing-Free-1.0.27-Android.apk`, 57,732,097 bytes; SHA-256 `E88C201EC456838847B25A96DEB038939142F0BECAF2A86D6C20CEE5F5F42B33`. Actions APK `release/1.0.27-android-actions/Fishing-Free-1.0.27-Android.apk`, 57,731,953 bytes; SHA-256 `17625E01DA5CBC71161C81B198B4AD70802807BD2D03581A2FC2134E4074383A`. Package `com.fishingfree.game`, version 1.0.27/code 27, min API 24, target API 36. Local and CI APK v2 signatures and 4-byte alignment verified. Actions [run 37166245631](https://github.com/kidu89/tidewater/actions/runs/37166245631) uploaded the artifact (archive digest `sha256:e78949781ac653e88f5af578501a8ba784ecceb377d89a27f460ce270a6a57b8`, expires 18 October 2026). | Debug signing is not a Play upload key. The 1.0.27 APK has not been installed on the owner's device; no physical Samsung A52 or Huawei installation has passed. |
| PWA / Pages | Version 1.0.27 deployed successfully from this commit in [run 37166225321](https://github.com/kidu89/tidewater/actions/runs/37166225321). | No physical phone browser check. |
| Windows / Steam | Local Windows x64 package built for 1.0.27 in `release/win-unpacked`; 752 files, 450,745,028 bytes. `Fishing Free.exe` reports 1.0.27.0. Actions [run 37166245511](https://github.com/kidu89/tidewater/actions/runs/37166245511) uploaded `Fishing-Free-Windows-x64` (214,624,981 bytes; digest `sha256:41d054e7f4711261339ca532b6d126a799877cdd4f6a5f5aa6ef83c6bcb3782e`; expires 18 October 2026); startup/loopback check passed. | Package unsigned; no Steam App/depot IDs, store approval, SteamPipe upload, Steam overlay/controller or Steam Deck check. Clean retail-PC 3D startup remains unverified. |
| iOS | Xcode Debug and Release App configurations now both use version 1.0.27/build 27, bundle `com.fishingfree.game`, deployment target iOS 15. | No signed installable IPA: the owner has no Apple Developer membership, certificate or provisioning profile. Safari PWA remains the iPhone route. |
| Ownership / license | Repo is `kidu89/tidewater`; game-facing name is Fishing Free. MIT license and third-party credits remain. | Preserve original MIT copyright and asset notices. |
| Product / revenue | The existing audit recommends a free base game and measured, test-first expansion. | No real-player retention, wishlist, conversion, sales or monetization data; no billing or ad SDK. |

## Install note

Both local and Actions APKs are structurally verified sideload builds. Their debug signing keys may differ; Android may refuse an in-place update if the installed APK was signed with another key. Do not uninstall an existing install without backing up its local save. The 1.0.27 APK has not been installed on an emulator or the owner's phones.

## Release gates still open

Physical Android installation/gameplay, a signed Play release, signed iOS IPA, Steamworks IDs and SteamPipe upload remain outstanding. Monetization decisions still need player data.
