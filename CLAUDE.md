# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Hue Chess / "Perk Chess" is a **purely cosmetic browser extension for lichess.org** that overlays RPG-style gamification: winning games earns XP, XP shifts the board color (hue) and fills a level progress bar, levels swap the board theme, and leveling up unlocks "perks" that grant bonus XP for meeting in-game challenges. It does not touch gameplay — no analysis, hints, or move suggestions. Manifest V3, supports both Chrome and Firefox from one source.

## Commands

```bash
npm install              # install deps
npm run build-chrome     # bundle into ./build-chrome (load unpacked here)
npm run build-moz        # bundle into ./build-firefox
npm run build            # build BOTH chrome and firefox
npm run build-prod       # production build (NODE_ENV=production) for both
```

There is **no test suite, no linter, and no watch mode.** `npm test` is a stub that exits 1. The build is not incremental — **you must re-run the build after every source change** and then reload the unpacked extension in the browser.

To load/test: `chrome://extensions` → enable Developer mode → "Load unpacked" → select `build-chrome` (or `about:debugging` for Firefox / `build-firefox`). The extension only activates on `*://lichess.org/*`.

## Build pipeline (build.js)

esbuild bundles `content.js` → `content-bundle.js` (this is the only bundled entry; it pulls in everything under `content_scripts/` plus npm deps like chess.js, the pgn-parser, tippy, toastify). `background-{chrome,firefox}.js` are copied unbundled. The correct manifest (`chrome-manifest.json` / `moz-manifest.json`) is copied to `manifest.json`, and `customStyles.css`, `*.html`, `imgs/`, and vendored `toastify.css`/`tippy.css` are copied into the build dir. `build-prod`'s only effect is setting `process.env.NODE_ENV`.

When bumping the release, update the version in **three places**: `package.json`, both manifest JSONs, and `CURRENT_VERSION` in `content_scripts/constants.js` (the version-mismatch check on startup keys off this constant).

## Architecture

Entry point is `content.js` → `initialization.js` `init()`. There is no framework; everything is vanilla JS that injects DOM into lichess's existing pages and reads game results from lichess's public APIs.

**All persistent state lives in `chrome.storage.local`** and is accessed only through getter/setter wrappers in `content_scripts/storageManagement.js` — do not call `browser.storage` directly elsewhere. `browser` is defined in `constants.js` as `chrome ?? browser` so the same code runs in both browsers. Key state keys: `completedBoards` (0-indexed current level), `currentHue` (0–100, the XP within the level), `activePerks` (max 2, see `MAX_PERKS`), `selectedUnlockOrder` (which specialization, indexes into `PERK_UNLOCK_ORDERS`), `prestige`, and several perk-specific buffers (`gladiatorLossBuffer`, `playedOpenings`, `winningStreak`, `preparationStatus`).

**Module responsibilities (`content_scripts/`):**
- `initialization.js` — first-run onboarding modal, `init()`, and `versionCheck()` which resets transient perk state on version change. Polls `window.location.href` every 1s to detect lichess SPA navigation and re-trigger monitoring.
- `gameMonitoring.js` — detects whether the user is in a game (`isPlayingGame` via lichess `users/status` API), then opens an **NDJSON stream** (`api/stream/games`) to await game end, fetches the finished game PGN (`game/export`), and decides win/loss. On a win it calls `incrementHue`. Also tracks rivalry (crosstable API) and the Preparation analysis-board timer.
- `rewardCalculation.js` — `getInitialRewardValue` derives base XP from the game's time control (longer = more XP). `incrementHue` adds base + perk bonus to `currentHue`; crossing 100 advances the board/level (and at `LEVEL_CAP` = 15 increments prestige and resets). `applyGladiatorPenalty` removes 35% on a Gladiator failure.
- `perks.js` — the bonus engine. `calculatePerkBonuses` inspects the parsed PGN (using **chess.js** to replay moves and the pgn-parser output) to check each active perk's condition and returns total bonus XP. Also owns `showPerkToast` (toastify popups). This is where per-perk game-analysis logic lives.
- `perkConstants.js` — `PERK_METADATA` (the 12 perks, by `id`/`internalName`), the perk-box HTML template, and `PERK_UNLOCK_ORDERS`: a 6-element array (one per specialization, indexed by `selectedUnlockOrder`) mapping perk `id` → unlock `level`. Specializations differ **only** in unlock order, not in perk behavior.
- `uiUpdates.js` — all DOM injection/rendering: the navbar XP progress bar, its tooltip, the perks selection modal (`perks.html`), board theme (`updateBoardStyle` via `BOARD_LEVEL_MAP`), and hue rotation (`updateHueRotateStyle`).
- `constants.js` — shared constants and the `browser` shim.

**Modals:** `settings.html` is the extension popup, opened from the toolbar icon via the background script (`background-{chrome,firefox}.js` injects `openSettingsModal()`). `perks.html` is the in-page perk/specialization selection modal, opened by clicking the injected XP progress bar.

## Conventions / gotchas

- Storage access is callback-based `chrome.storage.local`, wrapped in hand-rolled Promises — match that pattern (every storage helper returns a Promise) rather than introducing a new abstraction.
- Win/loss and all perk conditions are determined from the **post-game PGN fetched from lichess's API**, not from live DOM — perk logic should parse the game object, not scrape the board.
- The 1s `setInterval` URL poll in `init()` is how SPA navigation is handled; new pages that need monitoring hook in through `checkUrlAndStartMonitoring`.
- Some perks (Opportunist, Equalizer, Endgame Specialist) are known not to work in lichess variants except Chess960 — see `TIPS` in `constants.js`.
- `perk-style-tester.html` is a standalone scratch page for previewing perk toast styles; not part of the extension bundle.
```
