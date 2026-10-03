import { FISH, FISH_IDS, fishLengthCm } from './FishTable.js';
import { UPGRADES, nextLevel, FUEL_PRICE } from './Gear.js';
import { FishPortrait } from './FishPortrait.js';
import { shareCatch as shareCatchImage } from './CatchShare.js';
import { getOnlineFriendDuel } from './FriendDuel.js';

// DOM for the fishing game, in the look of the rest of the HUD (ui/ui.css tokens, .tw-glass):
//   top right     purse and cooler / hold load
//   bottom centre the fight: line tension with its safe band, the fish's stamina, line out
//   centre        "!" when a fish takes the bait
//   panels        inventory (I / Tab) and the fish stand's offer
//   catch card    full screen: the world dims and blurs, the fish lies side-on in its own studio light
//                 (FishPortrait) with the species above and length, weight, value, record below
const CSS = /* css */`
.gm-purse { position: absolute; top: var(--tw-edge-top); right: var(--tw-edge-right); display: flex; gap: var(--tw-3); align-items: center;
	padding: var(--tw-2) var(--tw-4); border-radius: 999px; font: 500 var(--tw-fs-lg) var(--tw-font); color: var(--tw-ink); pointer-events: none;
	transition: transform var(--tw-med) var(--tw-ease), right var(--tw-slow) var(--tw-ease); }
.tw-root[data-panel='open'] .gm-purse { right: calc(var(--tw-panel-w) + 2 * var(--tw-3)); }
.tw-root.is-photo .gm-panel { display: none; }
.gm-purse.is-bump { animation: gm-bump 420ms var(--tw-ease); }
@keyframes gm-bump { 30% { transform: scale(1.08); } }
.gm-money { font-family: var(--tw-mono); color: var(--tw-sun); font-weight: 600; }
.gm-cooler { display: flex; align-items: center; gap: var(--tw-2); color: var(--tw-ink-2); font-size: var(--tw-fs-md); }
.gm-cooler-bar { width: calc(64 * var(--tw-u)); height: calc(5 * var(--tw-u)); border-radius: 99px; background: var(--tw-fill-2); overflow: hidden; }
.gm-cooler-bar > span { display: block; height: 100%; width: 0; background: var(--tw-aqua); border-radius: inherit; transition: width var(--tw-med) var(--tw-ease); }
.gm-cooler.is-full .gm-cooler-bar > span { background: var(--tw-coral); }
.gm-objective { position: absolute; top: calc(var(--tw-edge-top) + calc(58 * var(--tw-u))); right: var(--tw-edge-right); display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: center; gap: var(--tw-2);
	width: min(calc(292 * var(--tw-u)), calc(100vw - 2 * var(--tw-edge-right))); padding: var(--tw-2) var(--tw-3); border-radius: var(--tw-r-lg); color: var(--tw-ink); pointer-events: auto;
	transition: opacity var(--tw-med) var(--tw-ease), border-color var(--tw-med) var(--tw-ease); }
.gm-objective.is-ready { border-color: rgba(240,196,106,0.58); box-shadow: 0 0 22px rgba(240,196,106,0.12); }
.gm-objective.is-muted { opacity: 0.38; pointer-events: none; }
.gm-objective-main { display: grid; grid-template-columns: 28px minmax(0, 1fr); gap: var(--tw-2); align-items: center; min-width: 0; min-height: 48px; padding: 0; border: 0; background: transparent; color: inherit; text-align: left; cursor: pointer; touch-action: manipulation; }
.gm-objective-icon { display: grid; place-items: center; width: 28px; height: 28px; border-radius: 50%; background: var(--tw-fill-2); color: var(--tw-aqua); font-size: 16px; }
.gm-objective-copy { display: block; min-width: 0; }
.gm-objective-copy small, .gm-objective-copy b, .gm-objective-copy span { display: block; }
.gm-objective-copy small { color: var(--tw-ink-3); font-size: 9px; font-weight: 700; letter-spacing: 0.12em; }
.gm-objective-copy b { overflow: hidden; margin-top: 1px; font-size: var(--tw-fs-sm); text-overflow: ellipsis; white-space: nowrap; }
.gm-objective-copy span { margin-top: 2px; color: var(--tw-ink-2); font: 500 var(--tw-fs-xs) var(--tw-mono); }
.gm-objective-track { display: block; height: 3px; margin-top: 5px; overflow: hidden; border-radius: 99px; background: var(--tw-fill-2); }
.gm-objective-track i { display: block; height: 100%; border-radius: inherit; background: var(--tw-aqua); transition: width var(--tw-med) var(--tw-ease); }
.gm-objective.is-ready .gm-objective-track i { background: var(--tw-sun); }
.gm-objective-claim { min-height: 42px; padding: 6px 12px; white-space: nowrap; }
.gm-fight { position: absolute; left: 50%; bottom: calc(max(calc(72 * var(--tw-u)), 13vh) + calc(58 * var(--tw-u))); transform: translateX(-50%);
	width: calc(360 * var(--tw-u)); padding: var(--tw-3) var(--tw-4); border-radius: var(--tw-r-lg); font: 500 var(--tw-fs-md) var(--tw-font); color: var(--tw-ink);
	opacity: 0; transition: opacity var(--tw-med) var(--tw-ease); pointer-events: none; }
.gm-fight.is-on { opacity: 1; }
.gm-fight-head { display: flex; justify-content: space-between; margin-bottom: var(--tw-2); }
.gm-fight-call { font-weight: 600; letter-spacing: 0.02em; }
.gm-fight-call.is-warn { color: var(--tw-coral); }
.gm-fight-call.is-good { color: var(--tw-aqua); }
.gm-fight-dist { font-family: var(--tw-mono); color: var(--tw-ink-2); }
.gm-tension { position: relative; height: calc(12 * var(--tw-u)); border-radius: 99px; background: var(--tw-fill-2); overflow: hidden; }
.gm-band { position: absolute; top: 0; bottom: 0; background: rgba(var(--tw-aqua-rgb), 0.28); border-left: 1px solid rgba(var(--tw-aqua-rgb), 0.6); border-right: 1px solid rgba(var(--tw-aqua-rgb), 0.6); }
.gm-danger { position: absolute; top: 0; bottom: 0; right: 0; width: 8%; background: rgba(255, 122, 133, 0.35); }
.gm-needle { position: absolute; top: -2px; bottom: -2px; width: 3px; margin-left: -1.5px; border-radius: 2px; background: var(--tw-ink); box-shadow: 0 0 8px rgba(255,255,255,0.6); }
.gm-needle.is-hot { background: var(--tw-coral); box-shadow: 0 0 10px var(--tw-coral); }
.gm-stamina { margin-top: var(--tw-2); display: flex; align-items: center; gap: var(--tw-2); color: var(--tw-ink-3); font-size: var(--tw-fs-sm); }
.gm-stamina-bar { flex: 1; height: calc(4 * var(--tw-u)); border-radius: 99px; background: var(--tw-fill-2); overflow: hidden; }
.gm-stamina-bar > span { display: block; height: 100%; background: var(--tw-sun); }
.gm-bite { position: absolute; left: 50%; top: 42%; transform: translate(-50%, -50%) scale(0.6); font: 800 calc(56 * var(--tw-u)) var(--tw-font);
	color: var(--tw-sun); text-shadow: 0 0 18px rgba(var(--tw-sun-rgb), 0.8), 0 2px 4px rgba(0,0,0,0.5); opacity: 0; pointer-events: none;
	transition: opacity 120ms, transform 200ms var(--tw-ease); }
.gm-bite.is-on { opacity: 1; transform: translate(-50%, -50%) scale(1); }
.gm-cast { position: absolute; left: 50%; top: 58%; transform: translateX(-50%); width: calc(140 * var(--tw-u)); height: calc(5 * var(--tw-u));
	border-radius: 99px; background: var(--tw-fill-2); overflow: hidden; opacity: 0; transition: opacity var(--tw-fast); pointer-events: none; }
.gm-cast.is-on { opacity: 1; }
.gm-cast > span { display: block; height: 100%; width: 0; background: linear-gradient(90deg, var(--tw-aqua), var(--tw-sun)); }
.gm-dot { position: absolute; left: 50%; top: 50%; width: 4px; height: 4px; margin: -2px; border-radius: 50%; background: rgba(255,255,255,0.7); box-shadow: 0 0 3px rgba(0,0,0,0.6); opacity: 0; pointer-events: none; }
.gm-dot.is-on { opacity: 1; }
.gm-panel { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -48%); width: calc(420 * var(--tw-u)); max-height: 70vh; display: flex; flex-direction: column;
	padding: var(--tw-4) var(--tw-5); border-radius: var(--tw-r-lg); font: 500 var(--tw-fs-md) var(--tw-font); color: var(--tw-ink);
	opacity: 0; pointer-events: none; transition: opacity var(--tw-med) var(--tw-ease), transform var(--tw-slow) var(--tw-ease); }
.gm-panel.is-open { opacity: 1; pointer-events: auto; transform: translate(-50%, -50%); }
.gm-panel h2 { margin: 0 0 var(--tw-1); font-size: calc(17 * var(--tw-u)); font-weight: 600; }
.gm-panel p.gm-sub { margin: 0 0 var(--tw-3); color: var(--tw-ink-3); font-size: var(--tw-fs-sm); }
.gm-list { overflow: auto; margin: 0 calc(-1 * var(--tw-2)); padding: 0 var(--tw-2); }
.gm-row { display: grid; grid-template-columns: 1fr auto auto auto; gap: var(--tw-3); align-items: center; padding: var(--tw-2) 0; border-bottom: 1px solid var(--tw-line); }
.gm-row .gm-kg, .gm-row .gm-val { font-family: var(--tw-mono); color: var(--tw-ink-2); }
.gm-row .gm-val { color: var(--tw-sun); }
.gm-row small { color: var(--tw-aqua); margin-left: var(--tw-1); }
.gm-empty { color: var(--tw-ink-3); padding: var(--tw-4) 0; text-align: center; }
.gm-foot { display: flex; justify-content: space-between; align-items: center; margin-top: var(--tw-3); gap: var(--tw-3); }
.gm-btn { font: 600 var(--tw-fs-md) var(--tw-font); color: #0b1418; background: var(--tw-aqua); border: 0; border-radius: 999px; padding: var(--tw-2) var(--tw-4); cursor: pointer; }
.gm-btn[disabled] { opacity: 0.4; cursor: default; }
.gm-btn.is-ghost { background: var(--tw-fill-2); color: var(--tw-ink); }
.gm-mini { font: 500 var(--tw-fs-sm) var(--tw-font); color: var(--tw-ink-2); background: var(--tw-fill); border: 1px solid var(--tw-line); border-radius: 999px; padding: 2px var(--tw-2); cursor: pointer; }
.gm-gauge { display: none; align-items: center; gap: var(--tw-2); color: var(--tw-ink-2); font-size: var(--tw-fs-md); }
.gm-gauge.is-on { display: flex; }
.gm-gauge b { font-family: var(--tw-mono); font-weight: 500; color: var(--tw-ink); }
.gm-fuel-bar > span { background: var(--tw-sun); }
.gm-fuel.is-low .gm-fuel-bar > span { background: var(--tw-coral); }
.gm-sonar-dots { letter-spacing: 1px; color: var(--tw-aqua); }
.gm-shop-row { display: grid; grid-template-columns: 1fr auto; gap: var(--tw-3); align-items: center; padding: var(--tw-2) 0; border-bottom: 1px solid var(--tw-line); }
.gm-shop-row small { display: block; color: var(--tw-ink-3); font-size: var(--tw-fs-sm); margin-top: 2px; }
.gm-shop-row .gm-have { color: var(--tw-ink-3); font-size: var(--tw-fs-sm); }
.gm-log { margin-top: var(--tw-3); color: var(--tw-ink-3); font-size: var(--tw-fs-sm); line-height: 1.5; }
.gm-tabs { display: flex; gap: var(--tw-2); margin: 0 0 var(--tw-3); }
.gm-tab { flex: 1; min-height: 42px; border: 1px solid var(--tw-line); border-radius: 999px; background: var(--tw-fill); color: var(--tw-ink-2); font: 600 var(--tw-fs-sm) var(--tw-font); cursor: pointer; }
.gm-tab.is-active { border-color: rgba(var(--tw-aqua-rgb), 0.55); background: rgba(var(--tw-aqua-rgb), 0.14); color: var(--tw-ink); }
.gm-inv-body { max-height: 43vh; min-height: 0; overflow: auto; overscroll-behavior: contain; }
.gm-achievement-list { display: flex; flex-direction: column; gap: var(--tw-2); }
.gm-achievement-row { display: grid; grid-template-columns: 36px minmax(0, 1fr) auto; gap: var(--tw-2); align-items: center; padding: var(--tw-2); border: 1px solid var(--tw-line); border-radius: var(--tw-r-md); background: rgba(255,255,255,0.025); }
.gm-achievement-row.is-done { border-color: rgba(var(--tw-aqua-rgb), 0.35); background: rgba(var(--tw-aqua-rgb), 0.07); }
.gm-achievement-icon { display: grid; place-items: center; width: 32px; height: 32px; border-radius: 50%; background: var(--tw-fill-2); font-size: 18px; }
.gm-achievement-copy { min-width: 0; }
.gm-achievement-copy b, .gm-achievement-copy small { display: block; }
.gm-achievement-copy b { font-size: var(--tw-fs-sm); }
.gm-achievement-copy small { margin-top: 2px; color: var(--tw-ink-3); font-size: var(--tw-fs-xs); line-height: 1.35; }
.gm-achievement-track { display: block; height: 4px; margin-top: 6px; overflow: hidden; border-radius: 99px; background: var(--tw-fill-2); }
.gm-achievement-track i { display: block; height: 100%; border-radius: inherit; background: var(--tw-aqua); }
.gm-achievement-progress { max-width: 88px; color: var(--tw-ink-3); font: 500 var(--tw-fs-xs) var(--tw-mono); text-align: right; }
.gm-achievement-row.is-done .gm-achievement-progress { color: var(--tw-aqua); }
.gm-achievement-row.is-ready { border-color: rgba(240,196,106,0.48); background: rgba(240,196,106,0.07); }
.gm-achievement-row.is-ready .gm-achievement-progress { max-width: none; color: var(--tw-sun); }
.gm-weekly-progress { min-width: 64px; }
.gm-weekly-note { margin-top: var(--tw-3); padding: var(--tw-3); border: 1px solid rgba(var(--tw-aqua-rgb), 0.22); border-radius: var(--tw-r-md); color: var(--tw-ink-2); font-size: var(--tw-fs-sm); line-height: 1.45; }
.gm-contract-claim { min-height: 44px; padding: 6px 12px; white-space: nowrap; }
.gm-species-filter { display: flex; align-items: center; gap: var(--tw-2); margin-bottom: var(--tw-2); color: var(--tw-ink-3); font-size: var(--tw-fs-sm); }
.gm-species-filter label { flex: none; }
.gm-species-filter select { flex: 1; min-width: 0; min-height: 38px; padding: 4px 30px 4px 10px; border: 1px solid var(--tw-line); border-radius: 999px;
	background: var(--tw-fill); color: var(--tw-ink); font: 600 var(--tw-fs-sm) var(--tw-font); }
.gm-species-list { display: flex; flex-direction: column; gap: var(--tw-2); }
.gm-species-row { display: grid; grid-template-columns: 36px minmax(0, 1fr); gap: var(--tw-2); align-items: center; padding: var(--tw-2); border: 1px solid var(--tw-line); border-radius: var(--tw-r-md); background: rgba(255,255,255,0.025); }
.gm-species-row.is-found { border-color: rgba(var(--tw-aqua-rgb), 0.35); background: rgba(var(--tw-aqua-rgb), 0.055); }
.gm-species-icon { display: grid; place-items: center; width: 32px; height: 32px; border-radius: 50%; background: var(--tw-fill-2); color: var(--tw-aqua); font-size: 18px; }
.gm-species-row:not(.is-found) .gm-species-icon { color: var(--tw-ink-3); }
.gm-species-copy { min-width: 0; }
.gm-species-copy b, .gm-species-copy small, .gm-species-copy span { display: block; }
.gm-species-copy b { font-size: var(--tw-fs-sm); }
.gm-species-copy small { margin-top: 2px; color: var(--tw-ink-3); font-size: var(--tw-fs-xs); line-height: 1.35; }
.gm-species-copy span { margin-top: 4px; color: var(--tw-ink-2); font: 500 var(--tw-fs-xs) var(--tw-mono); }
.gm-tabs .gm-tab { min-width: 0; padding-inline: var(--tw-1); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.gm-row .gm-cm { font-family: var(--tw-mono); color: var(--tw-ink-3); }
.gm-row.has-cm { grid-template-columns: 1fr auto auto auto auto; }

/* catch card: full screen. The world dims and blurs; the fish lies side-on in its own studio light
   (FishPortrait, a WebGPU canvas) between the name above and the numbers below */
.gm-catch-scrim { position: absolute; inset: 0; pointer-events: none; opacity: 0; visibility: hidden;
	background: radial-gradient(70% 60% at 50% 50%, rgba(10, 22, 34, 0.55) 0%, rgba(4, 9, 15, 0.86) 100%);
	-webkit-backdrop-filter: blur(10px) saturate(0.8); backdrop-filter: blur(10px) saturate(0.8);
	transition: opacity 420ms var(--tw-ease), visibility 0s linear 420ms; }
.gm-catch-scrim.is-on { opacity: 1; visibility: visible; transition: opacity 420ms var(--tw-ease), visibility 0s; }
.gm-catch { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: clamp(6px, 1.4vh, 18px);
	padding: var(--tw-6) var(--tw-edge); color: #f4ead6; font: 500 var(--tw-fs-md) var(--tw-font); text-align: center;
	pointer-events: none; opacity: 0; visibility: hidden; transition: opacity 300ms var(--tw-ease), visibility 0s linear 300ms; }
.gm-catch.is-on { opacity: 1; visibility: visible; transition: opacity 300ms var(--tw-ease), visibility 0s; }
.gm-catch-top, .gm-catch-bottom { display: flex; flex-direction: column; align-items: center; opacity: 0; }
.gm-catch.is-on .gm-catch-top { animation: gm-rise 700ms var(--tw-ease) 120ms forwards; }
.gm-catch.is-on .gm-catch-bottom { animation: gm-rise 700ms var(--tw-ease) 520ms forwards; }
@keyframes gm-rise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
.gm-catch-eyebrow { display: flex; align-items: center; justify-content: center; min-height: calc(26 * var(--tw-u)); margin-bottom: var(--tw-2);
	font-size: var(--tw-fs-sm); font-weight: 700; letter-spacing: 0.32em; text-transform: uppercase; color: rgba(244, 234, 214, 0.62); }
.gm-badge { display: inline-flex; align-items: center; gap: 0.5em; padding: calc(4 * var(--tw-u)) calc(12 * var(--tw-u)); border-radius: 4px;
	letter-spacing: 0.22em; font-weight: 800; transform: scale(2.4) rotate(-8deg); opacity: 0; }
.gm-catch.is-on .gm-badge { animation: gm-stamp 520ms cubic-bezier(0.3, 1.5, 0.5, 1) 900ms forwards; }
.gm-badge.is-record { color: #2a1604; background: linear-gradient(100deg, #f3cf8a 0%, #d9a441 40%, #fff0cf 50%, #d9a441 60%, #f3cf8a 100%); background-size: 250% 100%;
	box-shadow: 0 0 0 2px rgba(42, 22, 4, 0.35) inset, 0 0 26px rgba(217, 164, 65, 0.55); }
.gm-catch.is-on .gm-badge.is-record { animation: gm-stamp 520ms cubic-bezier(0.3, 1.5, 0.5, 1) 900ms forwards, gm-shine 2.6s var(--tw-ease-io) 1.6s infinite; }
.gm-badge.is-new { color: #062420; background: #6fd6c6; box-shadow: 0 0 0 2px rgba(6, 36, 32, 0.3) inset, 0 0 22px rgba(111, 214, 198, 0.45); }
.gm-badge.is-plain { color: rgba(244, 234, 214, 0.8); background: none; box-shadow: inset 0 0 0 1px rgba(244, 234, 214, 0.35); }
@keyframes gm-stamp { 0% { transform: scale(2.4) rotate(-8deg); opacity: 0; } 70% { transform: scale(0.94) rotate(-3deg); opacity: 1; } 100% { transform: scale(1) rotate(-3deg); opacity: 1; } }
@keyframes gm-shine { 0% { background-position: 100% 0; } 100% { background-position: -150% 0; } }
.gm-catch h2 { margin: 0; font-family: 'Caveat Brush', 'Kalam', cursive, var(--tw-font); font-weight: 400; font-size: clamp(38px, 6.2vw, 92px); line-height: 1; letter-spacing: 0.01em;
	color: #fbf1dc; text-shadow: 0 2px 0 rgba(0, 0, 0, 0.35), 0 8px 30px rgba(0, 0, 0, 0.45); }
.gm-catch-sci { margin-top: calc(4 * var(--tw-u)); font-family: 'Kalam', cursive, var(--tw-font); font-style: italic; color: rgba(244, 234, 214, 0.66); font-size: clamp(13px, 1.3vw, 19px); }
.gm-catch-stage { position: relative; width: min(94vw, 1400px, calc(46vh * 2.4)); aspect-ratio: 2.4 / 1; }
.gm-catch-stage canvas { position: absolute; inset: 0; width: 100%; height: 100%;
	-webkit-mask-image: linear-gradient(90deg, transparent 0%, #000 14%, #000 86%, transparent 100%); mask-image: linear-gradient(90deg, transparent 0%, #000 14%, #000 86%, transparent 100%); }
/* the card owns the screen: the minimap and the settings rail step aside */
.tw-root:has(.gm-catch.is-on) .gm-map, .tw-root:has(.gm-catch.is-on) .tw-rail { opacity: 0; pointer-events: none; transition: opacity 300ms; }
.gm-catch-stage::before { content: ''; position: absolute; left: 12%; right: 12%; bottom: 6%; height: 16%; border-radius: 50%;
	background: radial-gradient(closest-side, rgba(0, 0, 0, 0.5), transparent); opacity: 0; }
.gm-catch.is-on .gm-catch-stage::before { animation: gm-fade 900ms var(--tw-ease) 350ms forwards; }
@keyframes gm-fade { to { opacity: 1; } }
.gm-splash { position: absolute; left: 50%; top: 52%; width: 0; height: 0; pointer-events: none; }
.gm-splash i { position: absolute; left: 0; top: 0; width: var(--s); height: var(--s); margin: calc(var(--s) / -2); border-radius: 50%;
	background: radial-gradient(circle at 35% 35%, rgba(255, 255, 255, 0.95), rgba(190, 235, 245, 0.55) 55%, transparent 72%); opacity: 0; }
.gm-catch.is-on .gm-splash i { animation: gm-drop 1100ms cubic-bezier(0.2, 0.7, 0.3, 1) var(--d) forwards; }
@keyframes gm-drop { 0% { opacity: 0; transform: translate(0, 0) scale(0.4); } 12% { opacity: 1; }
	100% { opacity: 0; transform: translate(var(--x), var(--y)) scale(1); } }
.gm-catch-stats { display: flex; justify-content: center; gap: clamp(8px, 1.6vw, 22px); margin-top: var(--tw-2); }
.gm-stat { min-width: clamp(96px, 11vw, 150px); padding: calc(10 * var(--tw-u)) calc(16 * var(--tw-u)) calc(9 * var(--tw-u)); border-radius: 6px;
	background: linear-gradient(180deg, rgba(232, 220, 192, 0.12), rgba(232, 220, 192, 0.05)); box-shadow: inset 0 0 0 1px rgba(214, 180, 110, 0.38), 0 10px 30px rgba(0, 0, 0, 0.25); }
.gm-stat span { display: block; font-size: var(--tw-fs-xs); font-weight: 700; letter-spacing: 0.22em; text-transform: uppercase; color: rgba(222, 190, 125, 0.9); }
.gm-stat b { display: block; margin-top: calc(4 * var(--tw-u)); font: 600 clamp(20px, 2.2vw, 32px) var(--tw-mono); color: #fbf1dc; white-space: nowrap; }
.gm-stat b small { font-size: 0.55em; font-weight: 500; color: rgba(244, 234, 214, 0.7); margin-left: 0.2em; }
.gm-stat i { display: block; white-space: nowrap; font-style: normal; font-family: var(--tw-mono); font-size: var(--tw-fs-sm); color: rgba(244, 234, 214, 0.5); margin-top: 2px; }
.gm-stat.is-value b { color: #f0c46a; }
.gm-catch-note { margin-top: var(--tw-3); min-height: 1.4em; color: rgba(244, 234, 214, 0.78); font-family: 'Kalam', cursive, var(--tw-font); font-size: clamp(14px, 1.25vw, 19px); line-height: 1.4; }
.gm-catch-note b { color: #f0c46a; font-weight: 700; }
.gm-catch-note.is-warn { color: #ff9a8a; }
.gm-catch-foot { display: flex; align-items: center; justify-content: center; gap: var(--tw-2); margin-top: var(--tw-3); color: rgba(244, 234, 214, 0.5); font-size: var(--tw-fs-sm); }
.gm-catch-foot kbd { font: 600 var(--tw-fs-xs) var(--tw-mono); color: #f4ead6; padding: 2px calc(6 * var(--tw-u)); border-radius: 4px; border: 1px solid rgba(244, 234, 214, 0.3); background: rgba(244, 234, 214, 0.08); }
.gm-catch-timer { width: calc(80 * var(--tw-u)); height: 2px; margin-left: var(--tw-2); border-radius: 2px; background: rgba(244, 234, 214, 0.15); overflow: hidden; }
.gm-catch-timer > span { display: block; height: 100%; width: 100%; background: rgba(244, 234, 214, 0.55); transform-origin: 0 50%; }
.gm-catch.is-on .gm-catch-timer > span { animation: gm-timer var(--gm-catch-ms, 9000ms) linear forwards; }
.gm-catch-actions { display: flex; align-items: center; justify-content: center; gap: var(--tw-2); margin-top: var(--tw-3); pointer-events: auto; }
.gm-catch-action { min-height: 44px; padding: 9px 20px; touch-action: manipulation; }
.gm-catch.is-sharing .gm-catch-timer { visibility: hidden; }
.gm-catch-share-status { min-height: 1.2em; color: rgba(244, 234, 214, 0.66); font-size: var(--tw-fs-xs); }
@keyframes gm-timer { from { transform: scaleX(1); } to { transform: scaleX(0); } }
@media (prefers-reduced-motion: reduce) {
	.gm-catch.is-on .gm-catch-top, .gm-catch.is-on .gm-catch-bottom { animation: none; opacity: 1; }
	.gm-catch.is-on .gm-badge, .gm-catch.is-on .gm-badge.is-record { animation: none; transform: rotate(-3deg); opacity: 1; }
	.gm-catch.is-on .gm-splash i { animation: none; }
}
@media (max-width: 640px) {
	.gm-objective { width: min(270px, calc(100vw - 2 * var(--tw-edge-right))); }
	.gm-catch-stage { width: 96vw; }
	.gm-catch-stats { gap: 6px; }
	.gm-stat { min-width: 0; padding: 8px 10px; }
}
@media (max-height: 560px) and (orientation: landscape) {
	.gm-objective { top: calc(var(--tw-edge-top) + 50px); width: min(240px, calc(100vw - 2 * var(--tw-edge-right))); }
	.gm-catch { gap: 4px; padding: 8px 16px; }
	.gm-catch-eyebrow { min-height: 18px; margin-bottom: 0; }
	.gm-catch h2 { font-size: clamp(30px, 7vh, 52px); }
	.gm-catch-sci { display: none; }
	.gm-catch-stage { width: min(78vw, calc(32vh * 2.4)); }
	.gm-catch-stats { gap: 6px; margin-top: 4px; }
	.gm-stat { padding: 5px 9px; }
	.gm-stat b { font-size: 19px; }
	.gm-catch-note { min-height: 0; margin-top: 4px; font-size: 13px; }
	.gm-catch-actions { margin-top: 4px; }
	.gm-catch-foot { margin-top: 2px; }
}
`;

const h = ( tag, cls, html ) => {

	const e = document.createElement( tag );
	if ( cls ) e.className = cls;
	if ( html !== undefined ) e.innerHTML = html;
	return e;

};

export class GameHUD {

	constructor( ui, game ) {

		this.ui = ui;
		this.game = game;
		const style = h( 'style' );
		style.textContent = CSS;
		document.head.append( style );

		this.purse = h( 'div', 'gm-purse tw-glass', `<span class="gm-money">$0</span><span class="gm-cooler"><span class="gm-cooler-label">Cooler</span><span class="gm-cooler-bar"><span></span></span><span class="gm-cooler-kg">0 / 30 kg</span></span><span class="gm-gauge gm-fuel"><span>Fuel</span><span class="gm-cooler-bar gm-fuel-bar"><span></span></span><b class="gm-fuel-l">40 L</b></span><span class="gm-gauge gm-sonar"><span>Sonar</span><b class="gm-sonar-d">0 m</b><span class="gm-sonar-dots"></span></span>` );
		this.fuelEl = this.purse.querySelector( '.gm-fuel' );
		this.fuelBar = this.purse.querySelector( '.gm-fuel-bar > span' );
		this.fuelL = this.purse.querySelector( '.gm-fuel-l' );
		this.sonarEl = this.purse.querySelector( '.gm-sonar' );
		this.sonarD = this.purse.querySelector( '.gm-sonar-d' );
		this.sonarDots = this.purse.querySelector( '.gm-sonar-dots' );
		this.moneyEl = this.purse.querySelector( '.gm-money' );
		this.coolerEl = this.purse.querySelector( '.gm-cooler' );
		this.coolerBar = this.purse.querySelector( '.gm-cooler-bar > span' );
		this.coolerKg = this.purse.querySelector( '.gm-cooler-kg' );
		this.coolerLabel = this.purse.querySelector( '.gm-cooler-label' );
		this.objective = h( 'div', 'gm-objective tw-glass tw-interactive', `
			<button type="button" class="gm-objective-main" aria-label="Open current career objective">
				<span class="gm-objective-icon" aria-hidden="true">⚓</span>
				<span class="gm-objective-copy"><small></small><b></b><span></span><i class="gm-objective-track"><i></i></i></span>
			</button>
			<button type="button" class="gm-btn gm-objective-claim" hidden></button>` );
		this.objectiveMain = this.objective.querySelector( '.gm-objective-main' );
		this.objectiveIcon = this.objective.querySelector( '.gm-objective-icon' );
		this.objectiveLabel = this.objective.querySelector( '.gm-objective-copy small' );
		this.objectiveTitle = this.objective.querySelector( '.gm-objective-copy b' );
		this.objectiveProgress = this.objective.querySelector( '.gm-objective-copy span' );
		this.objectiveFill = this.objective.querySelector( '.gm-objective-track i' );
		this.objectiveClaim = this.objective.querySelector( '.gm-objective-claim' );

		this.fight = h( 'div', 'gm-fight tw-glass', `
			<div class="gm-fight-head"><span class="gm-fight-call">Fish on!</span><span class="gm-fight-dist">0 m</span></div>
			<div class="gm-tension"><span class="gm-band"></span><span class="gm-danger"></span><span class="gm-needle"></span></div>
			<div class="gm-stamina"><span>Fish</span><span class="gm-stamina-bar"><span></span></span></div>` );
		this.fCall = this.fight.querySelector( '.gm-fight-call' );
		this.fDist = this.fight.querySelector( '.gm-fight-dist' );
		this.fBand = this.fight.querySelector( '.gm-band' );
		this.fNeedle = this.fight.querySelector( '.gm-needle' );
		this.fStam = this.fight.querySelector( '.gm-stamina-bar > span' );

		this.bite = h( 'div', 'gm-bite', '!' );
		this.cast = h( 'div', 'gm-cast', '<span></span>' );
		this.castBar = this.cast.firstChild;
		this.dot = h( 'div', 'gm-dot' );
		this.catchScrim = h( 'div', 'gm-catch-scrim' );
		this.catchCard = h( 'div', 'gm-catch tw-glass' );
		this.catchOpen = false;
		this.catchSharing = false;
		this.currentCatch = null;
		const hud = ui.hud || ui.root;
		hud.append( this.catchScrim, this.purse, this.objective, this.fight, this.bite, this.cast, this.dot, this.catchCard );

		// panels (interactive)
		this.inv = h( 'div', 'gm-panel tw-glass tw-interactive' );
		this.stand = h( 'div', 'gm-panel tw-glass tw-interactive' );
		ui.root.append( this.inv, this.stand );
		this.invOpen = false;
		this.inventoryTab = 'hold';
		this.speciesFilter = 'all';
		this.standOpen = false;
		this._last = {};
		this.currentObjective = null;
		this.objectiveMain.onclick = () => {
			this.inventoryTab = this.currentObjective?.type === 'contract' ? 'contracts' : this.currentObjective?.type === 'weekly' ? 'weekly' : 'species';
			this.toggleInventory( true );
		};
		this.objectiveClaim.onclick = () => {
			const contract = this.currentObjective?.type === 'contract' ? this.game.state.claimContract( this.currentObjective.id ) : null;
			if ( contract ) this.toast( `Contract complete: ${ contract.title } · +$${ contract.reward }`, 3200 );
			const brief = this.currentObjective?.type === 'weekly' ? this.game.state.claimWeeklyBrief() : null;
			if ( brief ) this.toast( `Weekly brief complete: ${ brief.title } · +$${ brief.reward }`, 3200 );
		};
		this._readyContracts = new Set( game.state.contractProgress.filter( ( contract ) => contract.complete && ! contract.claimed ).map( ( contract ) => contract.id ) );
		this._readyWeeklyBrief = game.state.weeklyBrief.complete && ! game.state.weeklyBrief.claimed;
		game.state.onChange( ( state ) => {
			const unlocked = [ ...state.newAchievements ];
			state.newAchievements = [];
			const ready = state.contractProgress.filter( ( contract ) => contract.complete && ! contract.claimed && ! this._readyContracts.has( contract.id ) );
			this._readyContracts = new Set( state.contractProgress.filter( ( contract ) => contract.complete && ! contract.claimed ).map( ( contract ) => contract.id ) );
			const weeklyBrief = state.weeklyBrief;
			const weeklyReady = weeklyBrief.complete && ! weeklyBrief.claimed;
			this.refresh();
			const notices = [];
			if ( ready.length ) notices.push( `Contract ready: ${ ready[ 0 ].title } · claim $${ ready[ 0 ].reward } in your journal (I)` );
			if ( weeklyReady && ! this._readyWeeklyBrief ) notices.push( `Weekly brief ready: ${ weeklyBrief.title } · claim $${ weeklyBrief.reward } in your journal (I)` );
			if ( unlocked.length ) notices.push( `${ unlocked[ 0 ].icon } Achievement: ${ unlocked[ 0 ].title }${ unlocked.length > 1 ? ` · +${ unlocked.length - 1 } more` : '' }` );
			this._readyWeeklyBrief = weeklyReady;
			if ( notices.length ) this.toast( notices.join( '  ·  ' ), 3600 );
		} );
		this.refresh();
		this.showFriendChallenge();

	}

	toast( text, ms ) {

		this.ui.toast( text, ms );

	}

	async showFriendChallenge() {

		let challenge = this.game.friendChallenge;
		if ( ! challenge ) return;
		let onlineDuel = null;
		let onlineUnavailable = false;
		if ( challenge.serverId ) {
			try {
				onlineDuel = await getOnlineFriendDuel( challenge.serverId );
				challenge = this.game.friendChallenge = { ...challenge, species: onlineDuel.species, kg: onlineDuel.hostCatch.kg, cm: onlineDuel.hostCatch.cm };
			} catch ( error ) {
				onlineUnavailable = true;
				console.warn( 'online challenge lookup unavailable; using the catch details in the link', error );
			}
		}
		const fish = FISH[ challenge.species ];
		const result = onlineDuel?.guestCatch || challenge.result;
		if ( result ) {
			const target = onlineDuel?.hostCatch?.kg ?? challenge.kg;
			const outcome = result.kg > target ? 'Friend wins.' : result.kg < target ? 'You win.' : 'It is a tie.';
			const source = onlineDuel?.guestCatch ? 'Server result' : 'Shared result';
			this.toast( `${ source } · ${ fish.name }: ${ result.kg.toFixed( 2 ) } kg vs your ${ target.toFixed( 2 ) } kg · ${ outcome }`, 7000 );
		} else {
			const note = onlineUnavailable ? 'The server is unavailable; you can still share a result link.' : challenge.serverId ? 'The result will be saved online.' : 'Share your catch link to compare.';
			this.toast( `Friend challenge · catch a ${ fish.name } over ${ challenge.kg.toFixed( 2 ) } kg. ${ note }`, 7000 );
		}

	}

	refresh() {

		const s = this.game.state;
		const st = s.stats;
		this.moneyEl.textContent = `$${ s.money.toLocaleString() }`;
		const kg = s.holdKg;
		this.coolerLabel.textContent = s.upgrades.hold > 0 ? 'Hold' : 'Cooler';
		this.coolerKg.textContent = `${ kg.toFixed( 1 ) } / ${ st.holdKg } kg`;
		this.coolerBar.style.width = `${ Math.min( 100, kg / st.holdKg * 100 ) }%`;
		this.coolerEl.classList.toggle( 'is-full', kg > st.holdKg * 0.9 );
		if ( this._last.money !== undefined && this._last.money !== s.money ) {

			this.purse.classList.remove( 'is-bump' );
			void this.purse.offsetWidth;
			this.purse.classList.add( 'is-bump' );

		}

		this._last.money = s.money;
		this.refreshObjective();
		if ( this.invOpen ) this.renderInventory();
		if ( this.standOpen ) this.vendor && this.vendor.kind === 'shop' ? this.renderShop() : this.renderStand();

	}

	// per frame
	update( { fight, casting, power, bite, aiming, fuel = null, sonar = null } ) {

		this.objective.classList.toggle( 'is-muted', !! fight || !! casting || this.invOpen || this.standOpen || this.catchOpen );

		// boat instruments in the purse: fuel while aboard, the fish finder when fitted
		this.fuelEl.classList.toggle( 'is-on', !! fuel );
		if ( fuel ) {

			this.fuelBar.style.width = `${ fuel.litres / fuel.tank * 100 }%`;
			this.fuelL.textContent = `${ fuel.litres.toFixed( 0 ) } L`;
			this.fuelEl.classList.toggle( 'is-low', fuel.litres < fuel.tank * 0.15 );

		}

		this.sonarEl.classList.toggle( 'is-on', !! sonar );
		if ( sonar ) {

			this.sonarD.textContent = `${ sonar.depth.toFixed( 1 ) } m`;
			const n = Math.round( sonar.fish * 4 );
			this.sonarDots.textContent = '●'.repeat( n ) + '○'.repeat( 4 - n );

		}


		this.fight.classList.toggle( 'is-on', !! fight );
		if ( fight ) {

			const T = Math.min( fight.tension, 1.05 );
			this.fNeedle.style.left = `${ T / 1.05 * 100 }%`;
			this.fNeedle.classList.toggle( 'is-hot', fight.tension > fight.band[ 1 ] );
			this.fBand.style.left = `${ fight.band[ 0 ] / 1.05 * 100 }%`;
			this.fBand.style.width = `${ ( fight.band[ 1 ] - fight.band[ 0 ] ) / 1.05 * 100 }%`;
			this.fStam.style.width = `${ fight.stamina * 100 }%`;
			this.fDist.textContent = `${ fight.distance.toFixed( 1 ) } m`;
			let call = 'Reel in', cls = '';
			if ( fight.tension > 0.88 ) { call = 'Ease off!'; cls = 'is-warn'; }
			else if ( fight.surge > 0.55 ) { call = 'It\'s running!'; cls = 'is-warn'; }
			else if ( fight.tension < 0.15 ) { call = 'Slack line!'; cls = 'is-warn'; }
			else if ( fight.tension >= fight.band[ 0 ] && fight.tension <= fight.band[ 1 ] ) { call = 'Good pressure'; cls = 'is-good'; }
			this.fCall.textContent = call;
			this.fCall.className = 'gm-fight-call ' + cls;

		}

		this.bite.classList.toggle( 'is-on', !! bite );
		this.cast.classList.toggle( 'is-on', !! casting );
		if ( casting ) this.castBar.style.width = `${ power * 100 }%`;
		this.dot.classList.toggle( 'is-on', !! aiming && ! this.invOpen && ! this.standOpen );

	}

	refreshObjective() {

		const state = this.game.state;
		const contracts = state.contractProgress;
		const next = contracts.find( ( contract ) => ! contract.claimed );
		const brief = state.weeklyBrief;
		const firstContractClaimed = state.career.claimedContracts.includes( 'joes-first-order' );
		// Keep the first-session sale contract prominent. After that, surface the weekly
		// activity alongside the permanent contracts instead of hiding it until the career ends.
		const showWeekly = ( ! brief.claimed && ( brief.complete || firstContractClaimed ) ) || ! next;
		this.objective.classList.remove( 'is-ready' );
		this.objectiveClaim.hidden = true;

		if ( next && ! showWeekly ) {

			this.currentObjective = { type: 'contract', id: next.id };
			this.objectiveIcon.textContent = next.icon;
			this.objectiveLabel.textContent = 'HARBOR CONTRACT';
			this.objectiveTitle.textContent = next.title;
			this.objectiveProgress.textContent = next.complete ? `Reward ready · ${ next.reward }` : next.progressText;
			this.objectiveFill.style.width = `${ Math.round( next.progress * 100 ) }%`;
			this.objectiveMain.setAttribute( 'aria-label', `Open contract ${ next.title }: ${ next.progressText }` );
			if ( next.complete ) {
				this.objective.classList.add( 'is-ready' );
				this.objectiveClaim.hidden = false;
				this.objectiveClaim.textContent = `Claim ${ next.reward }`;
			}
			return;

		}

		this.currentObjective = { type: 'weekly' };
		this.objectiveIcon.textContent = brief.icon;
		this.objectiveLabel.textContent = 'WEEKLY HARBOR BRIEF';
		this.objectiveTitle.textContent = brief.title;
		this.objectiveProgress.textContent = brief.claimed ? 'Claimed · new brief Monday' : brief.complete ? `Reward ready · ${ brief.reward }` : brief.progressText;
		this.objectiveFill.style.width = `${ Math.round( brief.progress / brief.target * 100 ) }%`;
		this.objectiveMain.setAttribute( 'aria-label', `Open weekly harbor brief: ${ brief.description } ${ brief.progressText }` );
		if ( brief.complete && ! brief.claimed ) {
			this.objective.classList.add( 'is-ready' );
			this.objectiveClaim.hidden = false;
			this.objectiveClaim.textContent = `Claim ${ brief.reward }`;
		}

	}

	// ---- catch card
	// info: GameState.lastCatch ({ species, kg, cm, value, newSpecies, record, prevBestKg, prevBestCm, kept })
	showCatch( info, ms = 9000 ) {

		const f = FISH[ info.species ];
		this.currentCatch = info;
		const inch = info.cm / 2.54, lb = info.kg * 2.20462;
		const badge = info.record ? '<span class="gm-badge is-record">★ New record</span>'
			: info.newSpecies ? '<span class="gm-badge is-new">New species</span>' : '<span class="gm-badge is-plain">Catch</span>';
		let note;
		if ( ! info.kept ) note = `<div class="gm-catch-note is-warn">No room in the ${ this.game.state.upgrades.hold > 0 ? 'hold' : 'cooler' } · you let it go</div>`;
		else if ( info.record ) note = `<div class="gm-catch-note">Previous best <b>${ info.prevBestKg.toFixed( 2 ) } kg</b> · ${ info.prevBestCm } cm. Beaten by ${ ( info.kg - info.prevBestKg ).toFixed( 2 ) } kg.</div>`;
		else if ( info.newSpecies ) note = '<div class="gm-catch-note">First one in your fish log.</div>';
		else note = `<div class="gm-catch-note">Your best: ${ info.prevBestKg.toFixed( 2 ) } kg · ${ info.prevBestCm } cm</div>`;
		const challenge = this.game.friendChallenge;
		if ( challenge ) {
			if ( info.species === challenge.species ) {
				const status = info.kg > challenge.kg ? `Ahead by ${( info.kg - challenge.kg ).toFixed( 2 )} kg · share this catch to send the result.` : `Target: over ${ challenge.kg.toFixed( 2 ) } kg · keep fishing for a bigger ${ f.name.toLowerCase() }.`;
				note += `<div class="gm-catch-note">Friend challenge · ${ status }</div>`;
			} else {
				note += `<div class="gm-catch-note">Friend challenge · looking for a ${ FISH[ challenge.species ].name } over ${ challenge.kg.toFixed( 2 ) } kg.</div>`;
			}
		}
		// splash burst around the fish as it lands in view
		let drops = '';
		for ( let i = 0; i < 26; i ++ ) {

			const a = ( i / 26 ) * Math.PI * 2 + Math.random() * 0.3, r = 90 + Math.random() * 260;
			drops += `<i style="--s:${ ( 4 + Math.random() * 12 ).toFixed( 1 ) }px;--x:${ ( Math.cos( a ) * r * 1.8 ).toFixed( 0 ) }px;--y:${ ( Math.sin( a ) * r * 0.55 - 40 ).toFixed( 0 ) }px;--d:${ ( 250 + Math.random() * 220 ).toFixed( 0 ) }ms"></i>`;

		}

		const c = this.catchCard;
		c.style.setProperty( '--gm-catch-ms', `${ ms }ms` );
		c.innerHTML = `
			<div class="gm-catch-top">
				<div class="gm-catch-eyebrow">${ badge }</div>
				<h2>${ f.name }</h2>
				<div class="gm-catch-sci">${ f.sci || '' }</div>
			</div>
			<div class="gm-catch-stage"><canvas></canvas><div class="gm-splash">${ drops }</div></div>
			<div class="gm-catch-bottom">
				<div class="gm-catch-stats">
					<div class="gm-stat"><span>Length</span><b>${ info.cm }<small>cm</small></b><i>${ inch.toFixed( 1 ) } in</i></div>
					<div class="gm-stat"><span>Weight</span><b>${ info.kg < 1 ? info.kg.toFixed( 2 ) : info.kg.toFixed( 1 ) }<small>kg</small></b><i>${ lb.toFixed( 1 ) } lb</i></div>
					<div class="gm-stat is-value"><span>Value</span><b>$${ info.value }</b><i>${ info.kept ? 'in the cooler' : 'let go' }</i></div>
				</div>
				${ note }
				<div class="gm-catch-actions">
					<button type="button" class="gm-btn is-ghost gm-catch-action" data-share-catch aria-label="Share this catch">${ challenge && info.species === challenge.species ? 'Send result' : 'Challenge a friend' }</button>
					<button type="button" class="gm-btn gm-catch-action" data-continue-catch>Continue</button>
					<span class="gm-catch-timer" aria-hidden="true"><span></span></span>
				</div>
				<div class="gm-catch-share-status" role="status" aria-live="polite"></div>
				<div class="gm-catch-foot"><kbd>E</kbd> to continue</div>
			</div>`;
		const shareButton = c.querySelector( '[data-share-catch]' );
		shareButton.addEventListener( 'click', ( event ) => {
			event.preventDefault();
			event.stopPropagation();
			this.shareCatch( shareButton );
		} );
		c.querySelector( '[data-continue-catch]' ).addEventListener( 'click', ( event ) => {
			event.preventDefault();
			event.stopPropagation();
			if ( ! this.catchSharing ) this.game.endLanding();
		} );
		// restart the entrance even when a card is already up
		c.classList.remove( 'is-on' );
		void c.offsetWidth;
		c.classList.add( 'is-on' );
		this.catchScrim.classList.add( 'is-on' );
		this.catchOpen = true;
		// the fish itself: the real model in a studio, drawn live into the stage canvas
		try {

			if ( ! this.portrait ) this.portrait = new FishPortrait();
			if ( this.portrait.attach( c.querySelector( '.gm-catch-stage canvas' ) ) ) this.portrait.show( info.species, info.kg );

		} catch ( e ) {

			console.warn( 'fish portrait unavailable', e );

		}

	}

	async shareCatch( button ) {

		if ( this.catchSharing || ! this.currentCatch ) return;
		const status = this.catchCard.querySelector( '.gm-catch-share-status' );
		this.catchSharing = true;
		this.catchCard.classList.add( 'is-sharing' );
		button.disabled = true;
		if ( this.game.landing ) this.game.landing.cardT = 0;

		try {
			const fish = FISH[ this.currentCatch.species ];
			const result = await shareCatchImage( this.currentCatch, fish, this.catchCard.querySelector( '.gm-catch-stage canvas' ), this.game.friendChallenge );
			if ( result === 'copied' ) status.textContent = 'Catch details copied to clipboard.';
			if ( result === 'copied-offline' ) status.textContent = 'Challenge link copied; the online duel service was unavailable.';
			if ( result === 'shared-offline' ) status.textContent = 'Shared by link. The online duel service was unavailable.';
		} catch ( error ) {
			if ( error?.name !== 'AbortError' && ! error?.message?.toLowerCase().includes( 'cancel' ) ) {
				status.textContent = 'Could not open the share sheet. Try again.';
				console.warn( 'catch sharing unavailable', error );
			}
		} finally {
			this.catchSharing = false;
			this.catchCard.classList.remove( 'is-sharing' );
			if ( button.isConnected ) button.disabled = false;
			if ( this.game.landing ) this.game.landing.cardT = 0;
			const timer = this.catchCard.querySelector( '.gm-catch-timer > span' );
			if ( timer ) {
				timer.style.animation = 'none';
				void timer.offsetWidth;
				timer.style.animation = '';
			}
		}

	}

	hideCatch() {

		this.catchCard.classList.remove( 'is-on' );
		this.catchScrim.classList.remove( 'is-on' );
		this.catchOpen = false;
		this.catchSharing = false;
		if ( this.portrait ) this.portrait.detach();

	}

	// ---- inventory
	toggleInventory( force ) {

		this.invOpen = force ?? ! this.invOpen;
		if ( this.invOpen ) {

			this.closeStand();
			this.inventoryTab = this.inventoryTab || 'hold';
			this.renderInventory();
			releaseMouse();

		}

		this.inv.classList.toggle( 'is-open', this.invOpen );

	}

	renderInventory() {

		const s = this.game.state;
		const rows = s.inventory.map( ( f ) => `<div class="gm-row has-cm"><span>${ FISH[ f.species ].name }${ f.record ? '<small>record</small>' : '' }</span><span class="gm-cm">${ f.cm ?? Math.round( fishLengthCm( f.species, f.kg ) ) } cm</span><span class="gm-kg">${ f.kg.toFixed( 2 ) } kg</span><span class="gm-val">$${ f.value }</span><button class="gm-mini" data-release="${ f.id }">Release</button></div>` ).join( '' );
		const logged = Object.entries( s.log ).filter( ( [ k ] ) => FISH[ k ] ).map( ( [ k, v ] ) => `${ FISH[ k ].name }: ${ v.count } caught, best ${ v.bestKg.toFixed( 2 ) } kg · ${ v.bestCm ?? Math.round( fishLengthCm( k, v.bestKg ) ) } cm` ).join( '<br>' );
		const achievements = s.achievementProgress;
		const done = achievements.filter( ( achievement ) => achievement.unlocked ).length;
		const weekly = s.weeklyBrief;
		const foundSpecies = new Set( Object.keys( s.log ).filter( ( id ) => FISH[ id ] && s.log[ id ]?.count > 0 ) );
		const filterSpecies = FISH_IDS.filter( ( id ) => this.speciesFilter === 'all' || ( FISH[ id ].habitat[ this.speciesFilter ] || 0 ) > 0 );
		const habitatNames = { shallows: 'Shallows', pier: 'Pier', reef: 'Reef', bay: 'Open bay', deep: 'Offshore', cay: 'Pelican Cay', key: 'Turtle Key', mangrove: 'Mangrove Reach', atoll: 'Sunspire Atoll' };
		const timeNames = { any: 'Any time', day: 'Day', dawnDusk: 'Dawn and dusk', night: 'Night' };
		const speciesRows = filterSpecies.map( ( id ) => {
			const fish = FISH[ id ];
			const entry = s.log[ id ];
			const found = foundSpecies.has( id );
			const waters = Object.entries( fish.habitat ).filter( ( [ , weight ] ) => weight > 0 ).map( ( [ key ] ) => habitatNames[ key ] ).join( ' · ' );
			const activity = timeNames[ fish.time ] || 'Any time';
			const details = found
				? `${ entry.count } caught · best ${ entry.bestKg.toFixed( 2 ) } kg · ${ entry.bestCm ?? Math.round( fishLengthCm( id, entry.bestKg ) ) } cm`
				: 'Not in your catch log yet';
			const title = found ? fish.name : `Undiscovered species ${ FISH_IDS.indexOf( id ) + 1 }`;
			return `<div class="gm-species-row${ found ? ' is-found' : '' }">
				<span class="gm-species-icon" aria-hidden="true">${ found ? '🐟' : '◌' }</span>
				<span class="gm-species-copy"><b>${ title }</b>${ found ? `<small><i>${ fish.sci || '' }</i></small>` : '' }<small>${ waters } · ${ activity }</small><span>${ details }</span></span>
			</div>`;
		} ).join( '' );
		const contracts = s.contractProgress;
		const ready = contracts.filter( ( contract ) => contract.complete && ! contract.claimed ).length;
		const achievementRows = achievements.map( ( achievement ) => `<div class="gm-achievement-row${ achievement.unlocked ? ' is-done' : '' }">
			<span class="gm-achievement-icon" aria-hidden="true">${ achievement.icon }</span>
			<span class="gm-achievement-copy"><b>${ achievement.title }</b><small>${ achievement.description }</small><span class="gm-achievement-track"><i style="width:${ Math.round( achievement.progress * 100 ) }%"></i></span></span>
			<span class="gm-achievement-progress">${ achievement.unlocked ? 'Complete' : achievement.progressText }</span>
		</div>` ).join( '' );
		const showAchievements = this.inventoryTab === 'achievements';
		const showContracts = this.inventoryTab === 'contracts';
		const showSpecies = this.inventoryTab === 'species';
		const showWeekly = this.inventoryTab === 'weekly';
		const showHold = ! showAchievements && ! showContracts && ! showSpecies && ! showWeekly;
		const contractRows = contracts.map( ( contract ) => {
			const claimed = contract.claimed;
			const complete = contract.complete;
			const rowClass = claimed ? 'is-done' : complete ? 'is-ready' : '';
			const status = claimed ? 'Claimed' : complete ? `<button type="button" class="gm-btn gm-contract-claim" data-claim-contract="${ contract.id }">Claim $${ contract.reward }</button>` : contract.progressText;
			return `<div class="gm-achievement-row ${ rowClass }">
				<span class="gm-achievement-icon" aria-hidden="true">${ contract.icon }</span>
				<span class="gm-achievement-copy"><b>${ contract.title }</b><small>${ contract.description } · Reward $${ contract.reward }</small><span class="gm-achievement-track"><i style="width:${ Math.round( contract.progress * 100 ) }%"></i></span></span>
				<span class="gm-achievement-progress">${ status }</span>
			</div>`;
		} ).join( '' );
		const weeklyReset = new Intl.DateTimeFormat( 'en-US', { timeZone: 'UTC', weekday: 'short', month: 'short', day: 'numeric' } ).format( weekly.resetsAt );
		const weeklyClass = weekly.claimed ? 'is-done' : weekly.complete ? 'is-ready' : '';
		const weeklyStatus = weekly.claimed ? 'Claimed' : weekly.complete ? `<button type="button" class="gm-btn gm-contract-claim" data-claim-weekly>Claim $${ weekly.reward }</button>` : weekly.progressText;
		this.inv.innerHTML = `
			<div class="gm-tabs" role="tablist" aria-label="Journal">
				<button type="button" class="gm-tab${ showHold ? ' is-active' : '' }" role="tab" aria-selected="${ showHold }" data-inv-tab="hold">Hold</button>
				<button type="button" class="gm-tab${ showSpecies ? ' is-active' : '' }" role="tab" aria-selected="${ showSpecies }" data-inv-tab="species">Species</button>
				<button type="button" class="gm-tab${ showAchievements ? ' is-active' : '' }" role="tab" aria-selected="${ showAchievements }" data-inv-tab="achievements">Awards</button>
				<button type="button" class="gm-tab${ showWeekly ? ' is-active' : '' }" role="tab" aria-selected="${ showWeekly }" data-inv-tab="weekly">Weekly${ weekly.complete && ! weekly.claimed ? ' · 1' : '' }</button>
				<button type="button" class="gm-tab${ showContracts ? ' is-active' : '' }" role="tab" aria-selected="${ showContracts }" data-inv-tab="contracts">Contracts${ ready ? ` · ${ ready } ready` : '' }</button>
			</div>
			${ showAchievements ? `
				<h2>Career achievements</h2>
				<p class="gm-sub">${ done } of ${ achievements.length } earned · progress saves on this device</p>
				<div class="gm-inv-body gm-achievement-list">${ achievementRows }</div>` : showContracts ? `
				<h2>Harbor contracts</h2>
				<p class="gm-sub">Optional fishing goals · claim each reward once · no deadlines</p>
				<div class="gm-inv-body gm-achievement-list">${ contractRows }</div>` : `
				${ showWeekly ? `
				<h2>Weekly harbor brief · ${ weekly.weekId }</h2>
				<p class="gm-sub">Optional goal · resets ${ weeklyReset} at 00:00 UTC · no streaks</p>
				<div class="gm-inv-body gm-achievement-list"><div class="gm-achievement-row ${ weeklyClass }">
					<span class="gm-achievement-icon" aria-hidden="true">${ weekly.icon }</span>
					<span class="gm-achievement-copy"><b>${ weekly.title }</b><small>${ weekly.description } · Reward $${ weekly.reward }</small><span class="gm-achievement-track"><i style="width:${ Math.round( weekly.progress / weekly.target * 100 ) }%"></i></span></span>
					<span class="gm-achievement-progress gm-weekly-progress">${ weeklyStatus }</span>
				</div></div>
				<div class="gm-weekly-note">Progress counts fish landed in the named water. Your catch log and reward stay on this device.</div>` : `
				${ showSpecies ? `
				<h2>Field guide · ${ foundSpecies.size}/${ FISH_IDS.length } identified</h2>
				<p class="gm-sub">Find each species in its preferred water and active hours.</p>
				<div class="gm-species-filter"><label for="gm-species-filter">Water</label><select id="gm-species-filter" data-species-filter>
					<option value="all" ${ this.speciesFilter === 'all' ? 'selected' : '' }>All waters</option>
					<option value="shallows" ${ this.speciesFilter === 'shallows' ? 'selected' : '' }>Shallows</option>
					<option value="pier" ${ this.speciesFilter === 'pier' ? 'selected' : '' }>Pier</option>
					<option value="reef" ${ this.speciesFilter === 'reef' ? 'selected' : '' }>Reef</option>
					<option value="bay" ${ this.speciesFilter === 'bay' ? 'selected' : '' }>Open bay</option>
					<option value="deep" ${ this.speciesFilter === 'deep' ? 'selected' : '' }>Offshore</option>
					<option value="cay" ${ this.speciesFilter === 'cay' ? 'selected' : '' }>Pelican Cay</option>
					<option value="key" ${ this.speciesFilter === 'key' ? 'selected' : '' }>Turtle Key</option>
					<option value="mangrove" ${ this.speciesFilter === 'mangrove' ? 'selected' : '' }>Mangrove Reach</option>
					<option value="atoll" ${ this.speciesFilter === 'atoll' ? 'selected' : '' }>Sunspire Atoll</option>
				</select></div>
				<div class="gm-inv-body gm-species-list">${ speciesRows || '<div class="gm-empty">No species listed for this water.</div>' }</div>` : `
				<h2>${ s.upgrades.hold > 0 ? 'Fish hold' : 'Cooler' }</h2>
				<p class="gm-sub">${ s.inventory.length } fish · ${ s.holdKg.toFixed( 1 ) } of ${ s.stats.holdKg } kg · worth $${ s.holdValue }</p>
				<div class="gm-inv-body"><div class="gm-list">${ rows || '<div class="gm-empty">Nothing yet. Cast from the pier, the beach or the boat.</div>' }</div>
				${ logged ? `<div class="gm-log"><b>Fish log</b><br>${ logged }</div>` : '' }</div>` }` }` }
			<div class="gm-foot"><span class="gm-sub">${ showAchievements ? 'Earned through play' : showContracts ? 'Rewards fund gear and fuel' : showWeekly ? 'One in-game reward per UTC week' : showSpecies ? 'Habitat and activity hints' : 'Sell at the fish stand by the pier' }</span><button class="gm-btn is-ghost" data-close>Close (I)</button></div>`;
		this.inv.querySelector( '[data-close]' ).onclick = () => this.toggleInventory( false );
		for ( const b of this.inv.querySelectorAll( '[data-inv-tab]' ) ) b.onclick = () => {
			this.inventoryTab = b.dataset.invTab;
			this.renderInventory();
		};
		const speciesFilter = this.inv.querySelector( '[data-species-filter]' );
		if ( speciesFilter ) speciesFilter.onchange = () => {
			this.speciesFilter = speciesFilter.value;
			this.renderInventory();
		};
		for ( const b of this.inv.querySelectorAll( '[data-claim-contract]' ) ) b.onclick = () => {
			const contract = s.claimContract( b.dataset.claimContract );
			if ( contract ) this.toast( `Contract complete: ${ contract.title } · +$${ contract.reward }`, 3200 );
		};
		const claimWeekly = this.inv.querySelector( '[data-claim-weekly]' );
		if ( claimWeekly ) claimWeekly.onclick = () => {
			const brief = s.claimWeeklyBrief();
			if ( brief ) this.toast( `Weekly brief complete: ${ brief.title } · +$${ brief.reward }`, 3200 );
		};
		for ( const b of this.inv.querySelectorAll( '[data-release]' ) ) b.onclick = () => s.release( Number( b.dataset.release ) );

	}

	// ---- fish stand
	openStand( vendor ) {

		this.standOpen = true;
		this.vendor = vendor;
		this.toggleInventory( false );
		if ( vendor.kind === 'shop' ) this.renderShop();
		else this.renderStand();
		this.stand.classList.add( 'is-open' );
		releaseMouse();

	}

	closeStand() {

		this.standOpen = false;
		this.stand.classList.remove( 'is-open' );

	}

	renderStand() {

		const s = this.game.state;
		const v = this.vendor || { name: 'Fish buyer' };
		const rows = s.inventory.map( ( f ) => `<div class="gm-row has-cm"><span>${ FISH[ f.species ].name }</span><span class="gm-cm">${ f.cm ?? Math.round( fishLengthCm( f.species, f.kg ) ) } cm</span><span class="gm-kg">${ f.kg.toFixed( 2 ) } kg</span><span class="gm-val">$${ f.value }</span><button class="gm-mini" data-sell="${ f.id }">Sell</button></div>` ).join( '' );
		this.stand.innerHTML = `
			<h2>${ v.name }</h2>
			<p class="gm-sub">${ s.inventory.length ? v.greeting || 'Let\'s see what you caught.' : v.idle || 'Come back when you\'ve got fish.' }</p>
			<div class="gm-list">${ rows || '<div class="gm-empty">Your cooler is empty.</div>' }</div>
			<div class="gm-foot"><button class="gm-btn is-ghost" data-close>Leave (E)</button><button class="gm-btn" data-all ${ s.inventory.length ? '' : 'disabled' }>Sell all · $${ s.holdValue }</button></div>`;
		this.stand.querySelector( '[data-close]' ).onclick = () => this.closeStand();
		this.stand.querySelector( '[data-all]' ).onclick = () => this.game.sellAll();
		for ( const b of this.stand.querySelectorAll( '[data-sell]' ) ) b.onclick = () => this.game.sell( [ Number( b.dataset.sell ) ] );

	}

}

GameHUD.prototype.renderShop = function () {

	const s = this.game.state;
	const v = this.vendor;
	const rows = Object.entries( UPGRADES ).map( ( [ key, track ] ) => {

		const cur = track.levels[ s.upgrades[ key ] | 0 ];
		const next = nextLevel( s.upgrades, key );
		const btn = next
			? `<button class="gm-btn" data-buy="${ key }" ${ next.cost > s.money ? 'disabled' : '' }>$${ next.cost }</button>`
			: '<span class="gm-have">Top of the line</span>';
		return `<div class="gm-shop-row"><span>${ track.name }: ${ next ? next.label : cur.label }<small>Now: ${ cur.label }</small></span>${ btn }</div>`;

	} ).join( '' );
	const missing = s.stats.fuelL - s.fuelL;
	const fuelRow = `<div class="gm-shop-row"><span>Diesel · $${ FUEL_PRICE.toFixed( 2 ) } / L<small>Tank: ${ s.fuelL.toFixed( 0 ) } of ${ s.stats.fuelL } L</small></span>${ missing > 0.5 ? `<button class="gm-btn" data-fuel ${ s.money < FUEL_PRICE ? 'disabled' : '' }>Fill · $${ s.refuelCost() }</button>` : '<span class="gm-have">Full</span>' }</div>`;
	this.stand.innerHTML = `
		<h2>${ v.name }</h2>
		<p class="gm-sub">${ v.greeting } · You have $${ s.money.toLocaleString() }</p>
		<div class="gm-list">${ fuelRow }${ rows }</div>
		<div class="gm-foot"><span class="gm-sub">Upgrades take effect at once</span><button class="gm-btn is-ghost" data-close>Leave (E)</button></div>`;
	this.stand.querySelector( '[data-close]' ).onclick = () => this.closeStand();
	for ( const b of this.stand.querySelectorAll( '[data-buy]' ) ) b.onclick = () => this.game.buy( b.dataset.buy );
	const f = this.stand.querySelector( '[data-fuel]' );
	if ( f ) f.onclick = () => this.game.refuel();

};

function releaseMouse() {

	try {

		if ( document.pointerLockElement && document.exitPointerLock ) document.exitPointerLock();

	} catch ( e ) { /* ignore */ }

}
