# Timing Orbit

A single-tap arcade game for mobile. A node orbits a ring, and you tap the screen the moment it enters the target zone.

## Features

- **One-tap gameplay**: easy to learn, hard to master
- **Dual precision zones**: the safe arc gives +1 point, and the small sweet spot in the center gives +3 and builds your combo
- **Fever mode**: sweet-spot hits fill the Fever Meter for bonus scoring
- **Levels that speed up** as you progress
- **Synthesized audio**: all sound effects are generated in real time
- **Themes and unlocks**: earn new looks as you level up
- **Haptic feedback** on iOS

## Built with

- React + TypeScript
- Vite and Tailwind CSS
- Capacitor (iOS app)

## Run locally

**You'll need:** Node.js

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the dev server:
   ```bash
   npm run dev
   ```
3. Open http://localhost:3000 in your browser.

## Build the iOS app

```bash
npm run build
npx cap sync ios
npx cap open ios
```

Then build and run from Xcode.

## Project structure

| Folder | What's inside |
| --- | --- |
| `src/engine` | Game engine and physics |
| `src/components` | Menus, overlays and HUD |
| `src/audio` | Sound synthesizer |
| `src/themes` | Visual themes |
| `src/config` | Level settings |
| `src/services` | Ads integration |
| `ios` | Native iOS project |
| `website` | Support and privacy pages |

---

Made by Salma Elmasry
