# Fishing Free — Steam for Windows

The game is packaged as an Electron desktop app. It runs the bundled Vite build from a loopback-only local server, so the game does not depend on a website being online. The renderer has Node integration disabled, uses context isolation and sandboxing, blocks navigation away from the game, and only opens explicitly linked HTTPS pages in the system browser.

## Build the Steam folder locally

```powershell
npm ci
npm run desktop:package:win
```

The Steam-ready x64 folder is `release/win-unpacked/`. Launch `Fishing Free.exe` from that folder. It is not an installer; Steam installs the depot files and starts this executable.

## Build it with GitHub Actions

Run **Actions → Build Fishing Free for Steam (Windows) → Run workflow**. The run uploads `Fishing-Free-Windows-x64`, containing the same `win-unpacked` folder. The workflow can also be started by pushing a `desktop-v*` tag.

The owner's public repository is `kidu89/tidewater`. Windows run [`36878533392`](https://github.com/kidu89/tidewater/actions/runs/36878533392) built version 1.0.7 and passed the packaged startup smoke test. Its `Fishing-Free-Windows-x64` artifact is 202 MB with digest `sha256:9ea4e5b98e9c0dc1facb458abbeadc61d91f7579c59b1cc3b9f77e02f36d9c62`. It is a downloadable CI artifact, not a Steam build upload. Steamworks App ID, depot ID, store assets, approval and SteamPipe upload are still required.

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

- **Working title:** Fishing Free. The name is generic and may be difficult to search; clear the title and trademark before store submission.
- **Legal:** keep the root MIT `LICENSE`, `CREDITS.md`, and third-party notices. The web build copies the source notices into `dist/legal/`, which is included in the desktop package.
- **Graphics:** the default path needs a usable WebGPU adapter. On unsupported hardware the game switches to the touch-first Canvas fishing game. That mode has not yet been accepted as equivalent to the full 3D game and must be redesigned or validated before mobile release.
- **Windows runtime:** the 1.0.7 x64 package builds in GitHub Actions and its smoke test stages the package, launches the app and verifies its bundled page over loopback. A Steam install and overlay test on a real Windows machine remain outstanding.
- **Controller:** standard-mapped gamepads now control movement, swimming, steering, look, fishing, interactions and basic panel navigation. The mapping has not been checked on a physical controller or Steam Deck; do that before listing controller support. Keep Steam Input as the compatibility option for unusual layouts.
- **Store assets:** final capsule art, library assets, screenshots from the shipping build, trailer, localization, support contact and privacy disclosures still need an owner-approved release pass.
