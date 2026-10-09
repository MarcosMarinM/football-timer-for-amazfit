# Football Timer (Amazfit Bip 5)

A football stopwatch for the Amazfit Bip 5 (Zepp OS). Made for keeping time at
matches that do not have a big scoreboard.

## What it does

- Large stopwatch (`MM:SS`) that fills most of the screen.
- **Keeps running even if you leave the app.** It is not a background timer: it
  stores the real start time on the watch and works out the elapsed time when
  you come back, no matter how long you are away.
- **Adjustable starting minute**, so you do not have to add 45 to whatever the
  watch shows:
  - Presets: **0** and **45** (one tap for the second half).
  - Fine adjustment: **-5**, **-1**, **+1**, **+5** minutes (never goes below
    `00:00`).
- **START** to begin, **STOP** to stop and return to the start screen.
- The state is saved on the watch itself (`localStorage`).

## How to use it

1. For the second half, tap **45** (it shows `45:00`).
2. Tap **START**. You see the real minute at a glance (`60:00`, not `45 + 15`).
3. You can leave the app and come back: the clock keeps running.
4. **STOP** halts the stopwatch and returns to the start screen. You do not lose
   the time: you can reposition it with a preset or continue with **START**.

## Requirements

- **Node.js LTS** (Node 18/20/22 recommended).
- **Zeus CLI** installed **globally**:

  ```bash
  npm i @zeppos/zeus-cli -g
  ```

  > Note: install it globally, not as a project dependency. With a local
  > install, npm hoists `module-alias` and the CLI fails to start
  > (`Cannot find module 'zeppos-app-utils'`). Installed globally it works.

## Development

Install the type packages (optional, only for editor hints):

```bash
npm install
```

Open the **Amazfit Simulator**
(https://docs.zepp.com/docs/guides/tools/simulator/download/), download the
**Bip 5** emulator inside it and run:

```bash
zeus dev            # or: npm run dev
```

Changes to the pages reload automatically in the simulator.

## Testing on the real watch

1. Enable **Developer Mode** in the Zepp app (Profile → Settings → About → tap
   the logo 7 times).
2. Device → General → Developer Mode → **Mini Program** → **+** → scan.
3. Run `zeus preview` (or `npm run preview`), pick your Bip 5 and scan the QR
   code.

## Publishing

```bash
zeus build          # or: npm run build
```

This produces a `.zab` file in `dist/`. That is the file you upload to the
[console.zepp.com](https://console.zepp.com/) console.

## Notes

- The `appId` in `app.json` (`1130513`) is the one from the app created in the
  Zepp console. If you create another app, change it.
- `vender` is the developer name; adjust it if you like.

## Structure

```
app.js                     app entry point
app.json                   configuration (target: Bip 5, API 2.0, 320x380)
assets/bip-5/icon.png      icon
page/home/index.js         stopwatch logic
page/home/index.style.js   styles / measurements
```
