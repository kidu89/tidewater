# Steam capsule and library art — internal draft

These are concept assets for review, not approved store art.

- `source-concept.png` is AI-generated artwork guided by the in-game beach screenshot.
- `main-1232x706.png`, `header-920x430.png`, `small-462x174.png`, `vertical-capsule-748x896.png` and `library-capsule-600x900.png` are Steam-sized drafts with the exact working title overlaid in Oswald.
- `library-hero-3840x1240.png` is an art-only crop for the Steam library hero; it has no text overlay.
- Run `scripts/build-steam-capsules.ps1` from the repository root to recreate the horizontal store capsules. Run `scripts/build-steam-artwork.ps1` to create the vertical capsule and library assets. Existing outputs are preserved by default; use `-Force` only when intentionally replacing them.

The source concept is only 1672×940; the 3840×1240 hero export is an upscaled internal mockup, not final-resolution artwork. Store screenshots must come from the real game. Before submission, clear the working product name, capture current gameplay at Steam's required sizes, and confirm owner approval of every art asset.

`npm run capture:steam:browser -- release/steam-gameplay-captures-1.0.16-2026-10-03` builds the current source, starts a local preview and waits for 18 1920×1080 candidate frames from a connected browser. Open the URL printed in the terminal in the Codex in-app browser; the files are written to the named output directory. The views cover the beach, pier, sun glitter, sunset, village, reef and shallow seabed, offshore water, aerial island, palms, waterline, pier shallows, sun flare, outer islands and boat angles. The capture resets temporal upscaling history and wet-lens state after every camera teleport to prevent ghosted scenery from the previous view. These source-level captures are composition references, not approved store media from the packaged Windows candidate; select only clear, representative frames and recapture/recheck them in the exact shipping build before submission.
