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

A fresh local x64 candidate was packaged from the current working tree at release/win-unpacked-2026-10-03-mobile-startup/win-unpacked. Fishing Free.exe is version 1.0.16.0, 245,780,992 bytes, SHA-256 0D0E7A5FDEEEF595233E4897A769FB2E0CB19922AE67C48B78F6FF8C405E217A. resources/app.asar is 57,859,151 bytes, SHA-256 CB9BC27E11CEA068E2630078543277B6018C9D41447A83ED1094A79FC0B03A95. It includes the latest local game/source changes, remains unsigned, and has not been launched on a clean PC or through Steam. It is a folder for later SteamPipe preparation, not a published Steam build.
## Build it with GitHub Actions

Run **Actions → Build Fishing Free for Steam (Windows) → Run workflow**. The run uploads `Fishing-Free-Windows-x64`, containing the same `win-unpacked` folder. The workflow can also be started by pushing a `desktop-v*` tag.

The owner's public repository is `kidu89/tidewater`. Windows Actions run [37053852529](https://github.com/kidu89/tidewater/actions/runs/37053852529) built version 1.0.15 from commit `bd3887e`; packaging, executable-presence and packaged-startup checks passed, then uploaded `Fishing-Free-Windows-x64` (about 202 MB; digest `sha256:9dc14f88296418829906e85be8f41a21ac15e54e2df58e00ea68593b64d79f35`). The smoke test confirms the bundled game page responds over loopback, not that the 3D scene, Steam overlay or controller works on a retail PC. CI artifacts are not Steam uploads. Steamworks App ID, depot ID, store approval and SteamPipe upload are still required.

## Publish through SteamPipe

The Windows folder is a build artifact, not a published Steam build. After completing Steamworks onboarding and creating the app plus Windows depot, package the Windows build and generate a preview:

    npm ci
    npm run desktop:package:win
    .\scripts\prepare-steam-pipe.ps1 -AppId <STEAM_APP_ID> -DepotId <WINDOWS_DEPOT_ID>

Preview mode writes the app and depot VDF files under steamworks/generated and does not start SteamCMD or upload any content. Inspect the generated app-build VDF, depot VDF and content root. To produce a local preview manifest, run SteamCMD with the generated app-build VDF while its Preview value is 1; that check requires SteamCMD authentication but does not upload content. Use an account with Edit App Metadata permission for this app:

    Push-Location .\steamworks\generated
    & 'C:\path\to\steamcmd.exe' '+login' '<STEAM_ACCOUNT>' '+run_app_build' 'app_build_<STEAM_APP_ID>.vdf' '+quit'
    Pop-Location

For a real upload, first sign into SteamCMD interactively on the upload machine, finish Steam Guard, and retain that SteamCMD installation's config/config.vdf. The helper intentionally accepts no password or Steam Guard code. Then run:

    .\scripts\prepare-steam-pipe.ps1 -AppId <STEAM_APP_ID> -DepotId <WINDOWS_DEPOT_ID> -Upload -SteamCmdPath 'C:\path\to\steamcmd.exe' -SteamUsername '<STEAM_ACCOUNT>'

Upload mode sets Preview to 0 and invokes SteamCMD with the cached account to run the generated app-build VDF. It saves SteamCMD output to steamworks/generated/steamcmd-upload.log, checks the process exit code and requires a newly written depot manifest. Review that log and the Steamworks build history to confirm Valve accepted the build.

The generated app-build VDF keeps SetLive empty. Uploading stores the build in Steamworks but does not assign it to a public or beta branch; set a build live manually in Steamworks only after review. Do not put Steam passwords, Guard codes, or cached SteamCMD configuration in the repository or share them.

The VDF format follows Valve's [SteamPipe build documentation](https://partner.steamgames.com/doc/sdk/uploading?l=english). Valve documents preview builds as manifest-only and an empty SetLive value as leaving a build unassigned to a live branch.

Before using SteamPipe:

1. Create the Steamworks partner account and app entry, complete identity, tax and bank onboarding, and obtain the Steam App ID and Windows depot ID.
2. Publish the app's SteamPipe depot and launch-option configuration in Steamworks before uploading. The Windows launch option must point to Fishing Free.exe in the depot root.
3. Run the preview, inspect the VDF and manifest, then upload without setting the build live.
4. Review the SteamCMD log and Steamworks build history. Test a clean Steam install and launch on Windows 10/11, then check the Steam overlay, save persistence, window sizing, GPU fallback and controller setup before submitting the store page and build for review.

The Steam App ID, depot IDs, SteamCMD credentials, store art, store description, trailer, tested controller profile and release approval have not been supplied, so no SteamPipe upload or publication has been attempted.

## Current Steam release gates

### Steam Direct schedule and checkout rules

- Steam Direct charges **US$100 per app**. The fee is non-refundable, but Valve says it is recouped after the product reaches US$1,000 in adjusted gross revenue from the Steam Store and in-app purchases.
- For a first release, allow at least **30 days after paying the Steam Direct fee** before release, and keep the Coming Soon page public for at least **two weeks**.
- Valve's review normally takes **3–5 business days**; reserve at least **7 business days** for each store/build review cycle and leave room to fix a rejection.
- Transactions inside the Steam build must use Steam Wallet where Steam's review rules require it. This game currently has no checkout, paid currency or transaction service; preserve the planned demo-plus-one-time-full-game model until a Steamworks build and monetization design are approved.

Sources: [Steam Direct](https://partner.steamgames.com/steamdirect/) and [Steam review process](https://partner.steamgames.com/doc/store/review_process?language=english).

- **Working title:** Fishing Free. The name is generic and may be difficult to search; clear the title and trademark before store submission.
- **Legal:** keep the root MIT `LICENSE`, `CREDITS.md`, and third-party notices. The web build copies the source notices into `dist/legal/`, which is included in the desktop package.
- **Graphics:** the main game uses its bespoke WebGPU renderer and needs a usable WebGPU adapter. Local 1.0.19 offers optional Scenic Fishing after a WebGPU startup failure. It uses captures of the 3D world with a touch-first fishing loop; it is a mobile fallback, not a parity renderer and not the Steam graphics path. Verify the minimum Windows GPU target on a clean PC before release.
- **Windows runtime:** the 1.0.15 x64 package at [GitHub Actions run #13](https://github.com/kidu89/tidewater/actions/runs/37053852529) passes the packaging and staged-startup checks. The 202 MB artifact digest is `9dc14f88296418829906e85be8f41a21ac15e54e2df58e00ea68593b64d79f35`. A clean retail-PC launch that validates the 3D renderer, save persistence and Steam overlay remains outstanding.
- **Controller:** standard-mapped gamepads now control movement, swimming, steering, look, fishing, interactions and basic panel navigation. The mapping has not been checked on a physical controller or Steam Deck; do that before listing controller support. Keep Steam Input as the compatibility option for unusual layouts.
- **Store assets:** the three-size capsule concept set is in `docs/steam-assets-draft-v2/` and can be rebuilt with `scripts/build-steam-capsules.ps1`; it is not final or owner-approved. Six 1920×1080 source-preview scene captures have been shortlisted in `release/steam-gameplay-shortlist-2026-10-03-current/`; they omit the HUD and are not from the packaged Windows candidate, so capture/review final gameplay screenshots from the exact shipping build. A trailer, localization, support contact and privacy disclosures still need a release pass.

## Current local Windows candidate — 3 October 2026

- The current working tree is packaged in `release/win-unpacked/` for SteamPipe preparation and `release/Fishing-Free-1.0.16-Windows-x64-2026-10-03-candidate.zip` for transfer. The folder has 752 files totaling 448,240,112 bytes. The ZIP is 215,884,878 bytes (SHA-256 `F3FC660C2DDC4A6E4B25AFD3F73960928C8B168EB97345310AC06596C31A9D56`); all 966 archive entries were read successfully. `Fishing Free.exe` is version 1.0.16.0 (245,780,992 bytes; SHA-256 `2300E6CFF76B988F0DDC6C2B7FFD2E84E427BE83BAFC2C0B9A6B272A1565A87B`); `resources/app.asar` is 57,859,285 bytes (SHA-256 `EF8D158ECCA49F5B7D70F8E35B730451390C2745B197A6B70015D9C25F15F22F`).
- Electron Builder packaged the x64 directory successfully and skipped code signing because no certificate is configured. The archive check verifies the package files only; the game has not been launched from this candidate or checked on a clean PC or through Steam. This is a local candidate, not a Steam release.
## Latest local Windows candidate — weekly brief update

- The Windows x64 folder at `release/win-unpacked/` was rebuilt from the current working tree after surfacing the weekly harbor brief immediately after the opening sale contract. The game executable is **Fishing Free 1.0.16.0**. The folder has 752 files and 448,240,189 bytes; `Fishing Free.exe` SHA-256 `FE739803B6D305069EB6F70FF94D089A93A799059742491EA2E35D37AF69671D`; `resources/app.asar` is 57,859,362 bytes, SHA-256 `4453A3199AFCC96E72922B4A61E9EBC355F764BE3D602381208895E10396F367`.
- Transfer archive: `release/Fishing-Free-1.0.16-Windows-x64-2026-10-03-weekly-brief.zip`, 215,884,814 bytes, SHA-256 `F3896104F2B47073B0A3F47D81ECB6AAEDB46E4C35643D45F9231A824E66606D`. All 966 ZIP entries were read and decompressed successfully. Electron Builder skipped Windows signing because no certificate is configured. The candidate has not been launched or checked on a clean PC or through Steam; it is still not a Steam release.

## 1.0.17 local Windows candidate — Sunspire Atoll

The current working tree adds the Sunspire Atoll archipelago, its outer-shelf black grouper, and connected discovery, journal, weekly brief and contract progress. `npm run build` succeeded. The separate x64 Steam-folder candidate is at `release/1.0.17/win-unpacked/`; its transfer archive and exact hashes are recorded in [the release status](docs/RELEASE_STATUS_2026-10-03.md). This build has not been launched from the packaged directory, uploaded to SteamPipe or published. Windows signing was skipped because this machine has no code-signing certificate.

## Current Windows x64 candidate — 3 October 2026, refreshed

- Rebuilt the current working tree as Fishing Free 1.0.17 into `release/1.0.17-steam-current-2026-10-03/win-unpacked/`. The folder has 752 files totaling 448,244,986 bytes. The compact transfer archive is `release/Fishing-Free-1.0.17-Windows-x64-Steam-candidate-2026-10-03-optimal.zip`, 215,885,957 bytes, SHA-256 `DDED18FAFACB4655240529C34ADB7C181271AAD8A87ED1ABE6542745F1898D7D`; all 752 ZIP entries decompressed successfully.
- `Fishing Free.exe` reports version 1.0.17 (245,780,992 bytes; SHA-256 `A1C6189BC56A15BB39739FC504FFFC4DADCF669F1495083174B3A8A5A46E32EC`). `resources/app.asar` is 57,864,159 bytes (SHA-256 `D95DFA59934180EB3339206768602E37FED7BB279DE1E00FFCE520EB19F96946`).
- Electron Builder completed; Windows code signing was skipped because no certificate is configured. The packaged game has not been launched on a retail PC or through Steam. This is a local, unpublished build candidate, not a SteamPipe upload or public release.
## Previous local Windows x64 candidate — 3 October 2026, version 1.0.18

- The Steam-folder package is `release/1.0.18-steam-current-2026-10-03/win-unpacked/`. Transfer archive: [Fishing-Free-1.0.18-Windows-x64-Steam-candidate-2026-10-03-optimal.zip](release/Fishing-Free-1.0.18-Windows-x64-Steam-candidate-2026-10-03-optimal.zip), 218,301,260 bytes, SHA-256 `051C48ABAA2617A064A66357AAE273760DB4C794898B844B3105874BD76BFF62`. The ZIP was fully decompressed for an integrity check.
- `Fishing Free.exe` is version 1.0.18.0, SHA-256 `503BFDCDCA790558F5CA1DCC9B77DC7EBCC8D7E2AC9B9E9DA5DCA81F54E26A3B`; `resources/app.asar` is SHA-256 `3BA22365BDBA19BECD1E0FB3517AAC78DBE4B4E78C5FB1B5F23C6CD0FE6C8A62`. No Windows code-signing certificate is configured. It has not been launched from the package or tested through Steam, and it is not a SteamPipe upload or published release.
## Current local Windows x64 candidate — 3 October 2026, version 1.0.19

- The Steam-folder package is `release/1.0.19-steam-current-2026-10-03/win-unpacked/`. Transfer archive: [Fishing-Free-1.0.19-Windows-x64-Steam-candidate-2026-10-03-rescue.zip](release/Fishing-Free-1.0.19-Windows-x64-Steam-candidate-2026-10-03-rescue.zip), 218,301,334 bytes, SHA-256 `85B4CAEE9811D8C7AD3AE5A1FEB2706F1B3768F16356C55D797023133B6C785C`. All 752 archive entries were decompressed and matched the packaged folder's 450,744,833 bytes.
- `Fishing Free.exe` is version 1.0.19.0, SHA-256 `30F334AF8CFA210F6569AEF605D047F785B97279D52F30BD2740701ECFE0BFE6`; `resources/app.asar` SHA-256 is `7D27C103E57CE891F62B243D0D3182AF0F38F13E1D8764897F374AF283C8B792`. Windows signing was skipped because no certificate is configured. It has not been launched or checked through Steam; it is a local candidate, not a SteamPipe release.
## Previous locally verified Windows candidate — Fishing Free 1.0.19

The newest build is isolated at `release/1.0.19-steam-desktop-cache-fix-2026-10-03/win-unpacked/`. Download [the x64 candidate ZIP](release/Fishing-Free-1.0.19-Windows-x64-Steam-candidate-2026-10-03-cache-fix.zip) (218,367,487 bytes; SHA-256 `A720B7C6B47753C07E5F8459ABD48A590CEE5D029AA490562C15C384578EA7DC`). Its 966 archive entries were fully read and total 450,744,907 uncompressed bytes, matching the 752-file folder.

The package was launched from the staged directory with an isolated save profile. Electron exposed WebGPU, the 3D scene rendered at about 60 FPS, the intro/tutorial opened, and the local page registered no service workers. The previous packaged launch's CacheStorage exception is gone. Existing `npm test` suites all pass. The review screenshot at `release/1.0.19-steam-desktop-cache-fix-2026-10-03/smoke-run/gameplay.png` includes the first-run guide and must not be uploaded as final store media.

This remains an unsigned local candidate. No Steam App ID/depot or Steamworks login has been provided, and it has not been installed through the Steam client or tested with an overlay, controller or clean retail-PC profile. SteamPipe still requires the Steamworks app/depot IDs and an account with the required app permissions; Valve's upload flow uses build/depot scripts in the Steamworks SDK ([SteamPipe documentation](https://partner.steamgames.com/doc/sdk/uploading?l=english)). Steam Direct currently charges US$100 per app and recoups it after at least US$1,000 adjusted gross revenue ([Steam Direct fee](https://partner.steamgames.com/doc/gettingstarted/appfee)). Store capsules must follow Valve's current graphical-asset rules ([asset rules](https://partner.steamgames.com/doc/store/assets/rules?language=english)).

## Previous local Windows candidate — Fishing Free 1.0.20, before origin synchronization

- Transfer archive: [Fishing-Free-1.0.20-Windows-x64-Steam-candidate-2026-10-03.zip](release/Fishing-Free-1.0.20-Windows-x64-Steam-candidate-2026-10-03.zip), 218,301,680 bytes, SHA-256 `A820D38B5D5B581EDD422F24C388CE88DDF5ED96D28B78F77D1DA38D08F868FB`. All 752 ZIP entries decompressed; their total matches the 752-file staged folder (`450,745,197` bytes).
- `Fishing Free.exe`: 245,780,992 bytes, SHA-256 `D384452FE7E3FF5C4C6357B255E2E3C35C0344E0B1A94EBAF2BDA4701406A45D`. `resources/app.asar`: 60,364,370 bytes, SHA-256 `8820793303BE0014B69136098E77D87007BB39BD4D634FD10990199F16869E68`.
- The packaged app was launched from the staged folder with an isolated profile. Its bundled page returned HTTP 200, Electron 44.5.1 / Chromium 152 exposed WebGPU, the 3D island/tutorial scene rendered, and the desktop shell registered zero service workers. Review capture: `release/1.0.20-steam-desktop-2026-10-03/smoke-run/desktop-review.png`; it includes first-run guidance and is not approved store media.
- The candidate is local and unsigned. Steamworks App/depot IDs, Steam client/overlay/controller testing, a clean retail-PC check, approved store assets and SteamPipe upload remain outstanding. Packaging still reports missing publisher metadata and duplicate Capacitor references; these did not prevent launch and are listed for release cleanup.
## Current local Windows candidate — Fishing Free 1.0.20 — 3 October 2026, synchronized build

- The current x64 Steam-folder candidate is `release/1.0.20-steam-integrated-2026-10-03/win-unpacked/`. Download the transfer archive [Fishing-Free-1.0.20-Windows-x64-Steam-candidate-integrated-2026-10-03.zip](release/Fishing-Free-1.0.20-Windows-x64-Steam-candidate-integrated-2026-10-03.zip): 218,301,679 bytes, SHA-256 `30416A4BF8FE74BD799796E4FD5D54BB8CBFE9AC1145B44C810706613E477B89`. All 752 entries were decompressed and byte-counted successfully; they total 450,745,213 bytes.
- `Fishing Free.exe` is 245,780,992 bytes, SHA-256 `D769B0FBD474D11B537071E8BA8CAF4010E6D6A9AB4392781B77C0D64DBFD836`. `resources/app.asar` is 60,364,386 bytes, SHA-256 `9BB087A6E67593B97A89BBC2991160E3EF8D2C4F29CFB6CF01973C1AC40C2C2C`.
- Launched from the staged folder with an isolated profile. The local asset server returned HTTP 200; Electron 44.5.1 / Chromium 152 exposed `navigator.gpu` and returned an adapter; the game rendered the 3D island start scene and opened the first-run tutorial. The desktop page registered zero service workers. Review captures are in `release/1.0.20-steam-integrated-2026-10-03/smoke-run/` and include the tutorial, so they are not approved store screenshots.
- [GitHub Actions Windows/Steam run #18](https://github.com/kidu89/tidewater/actions/runs/37130456390) also completed successfully on commit `4f298e6`; its `Fishing-Free-Windows-x64` artifact is available for 14 days. This verifies the CI build and smoke workflow, but is not a SteamPipe upload.
- The candidate is unsigned and local. No Steamworks App ID/depot, Steam client/overlay/controller test, clean retail-PC test, final store assets or SteamPipe upload is available. Electron Builder notes missing author metadata and duplicate Capacitor references; they did not prevent packaging or launch.
