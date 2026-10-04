# Fishing Free 1.0.32 — Windows screenshot review

Status: internal candidate set for review; not owner-approved, not uploaded to Steam, and not a claim that the store is ready.

## Capture provenance

- Product: Fishing Free 1.0.32 Windows x64 production package.
- Executable: release/win-unpacked/Fishing Free.exe
- Executable size: 245,780,992 bytes.
- Executable SHA-256: A8CFBA8FCBFF09CBFCE17DF8714A9832BAC553F9F003C27DD4F1E745BE444.
- Each listed capture: 1920×1080 PNG, taken directly from the running packaged app.
- Capture method: Electron Chromium page screenshot at 1920×1080 from an isolated local profile. No pixel edits, crops, overlays, marketing text or compositing.
- Player actions: normal movement, fishing, hook/reel, inventory, boat boarding, helm and throttle inputs.
- Local capture directory: release/1.0.32-windows-candidate/ (Git-ignored).

## Frames retained for owner review

1. steam-1.0.32-gameplay-clean.png — clean harbor gameplay and standard HUD.
2. store-10-pier-walk-clean.png — first-person pier walk with boat and distant islands.
3. store-04-pier-fishing.png — rod and cast line over the water.
4. store-05-bobber-watch.png — natural bite cue and strike prompt.
5. store-07-catch-record.png — striped mullet catch card from a real catch.
6. store-08-fish-logbook.png — journal updated by that catch.
7. store-13-helm.png — harbor boat view while at the normal third-person helm.
8. store-14-boat-underway.png — boat underway offshore with wake and island scenery.

## Frames rejected from store consideration

- store-02-cast-at-harbor.png — line landed on sand.
- store-06-fish-fight.png — slack-line warning and distorted rod pose.
- store-09-boat-approach.png and store-09b-pier-steps.png — obstructed under-dock views.
- store-15-pelican-cay-approach.png — boat grounded against rocks and tilted. This is not a suitable marketing capture. The built-in harbor tow recovered the boat to the pier and retained the location discovery.
- Any frame with a developer inspector, hidden gameplay state, broken physics, placeholder, or feature not present in the candidate.

## Decision

The retained frames show real game scenes and systems, but they still need owner review and approval. The Pelican Cay discovery is verified in local game state; a safe, clean screenshot at the destination has not yet been captured. Keep the Steam media gate open until that shot is obtained or the store set is deliberately approved without it. Keep Steamworks onboarding, title clearance, rights review and release approval as separate outstanding gates.

Steam says store screenshots should be 1920×1080 and 16:9 and requires at least five. Verify the current specification in [Steam graphical asset requirements](https://partner.steamgames.com/doc/store/assets?language=english) before upload.
