# Three.js Game Framework (Electron + React + Vite)

A game-focused desktop framework using:

- **Electron** for desktop packaging and native shell
- **React** for UI layers (HUD, menus, overlays)
- **Vite** for fast dev/build workflows
- **Three.js** as the rendering/game foundation

## Quick Start

```bash
npm install
npm run dev
```

## Scripts

- `npm run dev` — starts Vite and Electron together
- `npm run build` — builds the renderer app with Vite
- `npm run preview` — previews the Vite build
- `npm run electron` — runs Electron directly
- `npm run dist` — builds and packages desktop app via electron-builder

## Project Structure

```txt
.
├── electron/
│   ├── main.js
│   └── preload.js
├── src/
│   ├── components/
│   │   └── GameCanvas.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── styles.css
├── index.html
├── package.json
└── vite.config.js
```

## Notes

- Security defaults are enabled (`contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`).
- Start building gameplay in `src/components/GameCanvas.jsx`.
