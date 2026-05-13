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
New-World-Online-Framework
├─ electron
│  ├─ main.js
│  └─ preload.js
├─ index.html
├─ package-lock.json
├─ package.json
├─ PROJECT_DOCUMENTATION.md
├─ README.md
├─ src
│  ├─ App.jsx
│  ├─ components
│  │  ├─ GameCanvas.jsx
│  │  └─ InventoryPanel.jsx
│  ├─ data
│  │  ├─ gameData.js
│  │  ├─ items
│  │  │  ├─ consumables.json
│  │  │  ├─ keys.json
│  │  │  └─ tools.json
│  │  ├─ items.json
│  │  ├─ mapConfig.json
│  │  ├─ modelCatalog.json
│  │  ├─ objectLogic.json
│  │  ├─ scenes
│  │  │  ├─ crystal-gate.json
│  │  │  ├─ mystic-hills.json
│  │  │  ├─ scenes.json
│  │  │  └─ starter-valley.json
│  │  └─ worldData.json
│  ├─ game
│  │  ├─ camera.js
│  │  └─ inventory.js
│  ├─ logic
│  │  └─ devPanelLogic.js
│  ├─ main.jsx
│  ├─ models
│  │  └─ devPanelModel.js
│  ├─ scenes
│  │  └─ sceneLoader.js
│  └─ styles.css
└─ vite.config.js
```

## Notes

- Security defaults are enabled (`contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`).
- Start building gameplay in `src/components/GameCanvas.jsx`.