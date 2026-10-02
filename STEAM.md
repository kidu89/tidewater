# Fishing Free — Steam for Windows

The current store-page copy, verified feature list and media/release checklist are in [docs/STEAM_STORE_DRAFT.md](docs/STEAM_STORE_DRAFT.md). It is an internal draft, not a published Steam page.

The game is packaged as an Electron desktop app. It runs the bundled Vite build from a loopback-only local server, so the game does not depend on a website being online. The renderer has Node integration disabled, uses context isolation and sandboxing, blocks navigation away from the game, and only opens explicitly linked HTTPS pages in the system browser.

## Product identity and source notices

The public repository is owned by `kidu89`, and the game UI, package metadata and executable are branded **Fishing Free**. The `tidewater` repository slug and legacy browser-storage keys remain for URL and save compatibility; they are not product labels. Keep the upstream MIT copyright/license notice and all third-party asset credits in source and shipping builds. Those notices preserve the source and asset licenses; they are not publisher branding.

## Build the Steam folder locally

```powershell
npm ci
npm run desktop:package:win
```

The Steam-ready x64 folder is `release/win-unpacked/`. Launch `Fishing Free.exe` from that folder. It is not an installer; Steam installs the depot files and starts this executable.

The 1.0.15 x64 candidate was built from the clean checkout of current `main` plus the reviewed release fixes. The parent workspace archive `Fishing-Free-1.0.15-Windows-x64-2026-10-02-release-candidate.zip` is 213,485,521 bytes (SHA-256 `ACE43B30A52BB5DEAFBE6B92CD1968EE20C4F169B934B3D8FE86BAF7D36FA628`). Its ZIP entries fully decompressed and contain `Fishing Free.exe` and `resources/app.asar`; the executable metadata reads 1.0.15. It is unsigned. The GitHub packaging and startup workflow passed. A clean retail-PC, controller and Steam-client check remain before SteamPipe.

The local workspace also contains a 1.0.16 x64 build at `release/1.0.16/win-unpacked`, created from local commit `b008e97` (not yet pushed). `Fishing Free.exe` reports 1.0.16.0 (245,780,992 bytes; SHA-256 `61E1E6E5029A6B08D254D8C1A7B7FEE450BD47A568F4DF7027162E864BCF013B`); `resources/app.asar` is 57,879,773 bytes (SHA-256 `906FAB251DD0F126C963BA0C8CEFAA3AB93DA6B9198CB1F17C08D1C915F472CF`). It is unsigned and has not been launched on a retail Windows PC or through Steam. Treat it as a local candidate, not a published or Steam-tested release.

On 3 October, an additional 1.0.16 candidate was packaged after stabilizing the Electron server origin so browser saves use the same `127.0.0.1:43761` origin across launches; the app also focuses its existing window on a second launch. The folder is `release/1.0.16/win-unpacked-stable-origin/`; the handoff archive is `release/1.0.16/Fishing-Free-1.0.16-Windows-x64-stable-save-candidate.zip` (215,890,966 bytes; SHA-256 `8AE178F8BA77C0E424C6A5178C338A3A9E73F22605C84ED4D41D57BFB994B714`). The executable reports 1.0.16.0 (245,780,992 bytes; SHA-256 `76372538E110FE810929BEB1E714B90353F51F6359007D9B05653FABDC839ACE`); `resources/app.asar` is 57,880,529 bytes (SHA-256 `013C3FB0F7A25E9F3957015BB43102D8014C8B964C8175C64C0E2D977CB8EBF4`). Electron Builder completed, and the packaged `desktop/main.cjs` byte-for-byte matches source. This candidate is unsigned. Save persistence across an actual close/reopen, clean-PC startup, Steam overlay, controller, Steam Cloud and Steam-client installation have not been verified.

After the 3 October whale-surfacing adjustment, local HEAD `78dba97` was packaged as `release/1.0.16/win-unpacked-whale-tuning-2026-10-03/`; it includes the game-code adjustment from `c1fa95b`. The handoff archive is `release/1.0.16/Fishing-Free-1.0.16-Windows-x64-whale-tuning-candidate.zip` (215,891,308 bytes; SHA-256 `948603D3154CBE6D7FEDE38FC26DEE215662178B551B31E5A0C5B3333BF5D6C5`). Its 752 files extracted successfully; `Fishing Free.exe` reports 1.0.16 (245,780,992 bytes; SHA-256 `1D4AC371A9AA84E19EA73710CF48C8CC93C7CCFADB82718FC4056AA0C04CE95E`) and `resources/app.asar` is 57,880,874 bytes (SHA-256 `534FFF3F4545BF1BF7E0F67CDE3B693016AA0FEB73C1AEA3E78CE02142B1BDE9`). This is the latest local candidate, unsigned and not yet launched on a retail PC or through Steam.

## Build it with GitHub Actions

Run **Actions → Build Fishing Free for Steam (Windows) → Run workflow**. The run uploads `Fishing-Free-Windows-x64`, containing the same `win-unpacked` folder. The workflow can also be started by pushing a `desktop-v*` tag.

The owner's public repository is `kidu89/tidewater`. Windows Actions run [37053852529](https://github.com/kidu89/tidewater/actions/runs/37053852529) built version 1.0.15 from commit `bd3887e`; packaging, executable-presence and packaged-startup checks passed, then uploaded `Fishing-Free-Windows-x64` (about 202 MB; digest `sha256:9dc14f88296418829906e85be8f41a21ac15e54e2df58e00ea68593b64d79f35`). The smoke test confirms the bundled game page responds over loopback, not that the 3D scene, Steam overlay or controller works on a retail PC. CI artifacts are not Steam uploads. Steamworks App ID, depot ID, store approval and SteamPipe upload are still required.

## Publish through SteamPipe

The Windows folder is a build artifact, not a published Steam build. The helper script creates SteamPipe app and depot VDF files after you obtain the real IDs:

```powershell
npm ci
npm run desktop:package:win
.\scripts\prepare-steam-pipe.ps1 -AppId <STEAM_APP_ID> -DepotId <WINDOWS_DEPOT_ID>
```

The first generated app-build file is preview-only: it produces a local manifest for inspection and does not upload. After checking the generated manifest and confirming the IDs and content root, regenerate in upload mode:

```powershell
.\scripts\prepare-steam-pipe.ps1 -AppId <STEAM_APP_ID> -DepotId <WINDOWS_DEPOT_ID> -Upload
```

The generated files are in `steamworks/generated/`, which is ignored by Git. Install Steamworks SDK on the Windows upload machine, sign into SteamCMD with an account that has **Edit App Metadata** permission for this app, then run the generated app-build VDF. Keep the Steam password and Steam Guard code out of the command history and source tree. `SetLive` is deliberately blank in every generated config, so uploading a build does not automatically make it available to a branch. Assign the build to an internal beta branch in Steamworks after upload and testing.

The VDF format follows Valve's [SteamPipe build documentation](https://partner.steamgames.com/doc/sdk/uploading?l=english). Valve documents preview builds as manifest-only and an empty `SetLive` value as leaving the build unassigned to a live branch.

Before using SteamPipe:

1. Create the Steamworks partner account and app entry, complete identity, tax and bank onboarding, and obtain the Steam App ID and Windows depot ID.
2. Publish the app's SteamPipe depot and launch-option configuration in Steamworks before uploading. The Windows launch option must point to `Fishing Free.exe` in the depot root.
3. Run the preview, inspect the manifest, then upload the build without setting it live.
4. Test a clean Steam install and launch on Windows 10/11, then check the Steam overlay, save persistence, window sizing, GPU fallback and the controller setup before submitting the store page and build for review.

The Steam App ID, depot IDs, SteamCMD credentials, store art, store description, trailer, tested controller profile and release approval have not been supplied, so this project does not upload to or publish on Steam automatically.

## Current Steam release gates

### Steam Direct schedule and checkout rules

- Steam Direct charges **US$100 per app**. The fee is non-refundable, but Valve says it is recouped after the product reaches US$1,000 in adjusted gross revenue from the Steam Store and in-app purchases.
- For a first release, allow at least **30 days after paying the Steam Direct fee** before release, and keep the Coming Soon page public for at least **two weeks**.
- Valve's review normally takes **3–5 business days**; reserve at least **7 business days** for each store/build review cycle and leave room to fix a rejection.
- Transactions inside the Steam build must use Steam Wallet where Steam's review rules require it. This game currently has no checkout, paid currency or transaction service; preserve the planned demo-plus-one-time-full-game model until a Steamworks build and monetization design are approved.

Sources: [Steam Direct](https://partner.steamgames.com/steamdirect/) and [Steam review process](https://partner.steamgames.com/doc/store/review_process?language=english).

- **Working title:** Fishing Free. The name is generic and may be difficult to search; clear the title and trademark before store submission.
- **Legal:** keep the root MIT `LICENSE`, `CREDITS.md`, and third-party notices. The web build copies the source notices into `dist/legal/`, which is included in the desktop package.
- **Graphics:** the default path needs a usable WebGPU adapter. On unsupported hardware the game switches to the touch-first Canvas fishing game. That mode has not yet been accepted as equivalent to the full 3D game and must be redesigned or validated before mobile release.
- **Windows runtime:** the 1.0.15 x64 package at [GitHub Actions run #13](https://github.com/kidu89/tidewater/actions/runs/37053852529) passes the packaging and staged-startup checks. The 202 MB artifact digest is `9dc14f88296418829906e85be8f41a21ac15e54e2df58e00ea68593b64d79f35`. A clean retail-PC launch that validates the 3D renderer, save persistence and Steam overlay remains outstanding.
- **Controller:** standard-mapped gamepads now control movement, swimming, steering, look, fishing, interactions and basic panel navigation. The mapping has not been checked on a physical controller or Steam Deck; do that before listing controller support. Keep Steam Input as the compatibility option for unusual layouts.
- **Store assets:** the three-size capsule concept set is in `docs/steam-assets-draft-v2/` and can be rebuilt with `scripts/build-steam-capsules.ps1`; it is not final or owner-approved. Library art, screenshots and trailer from the shipping build, localization, support contact and privacy disclosures still need a release pass.
