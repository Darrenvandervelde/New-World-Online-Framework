# New World Online Framework

Open-world game framework built with **Electron + React + Vite + Three.js**.

## Features

| System | Description |
|--------|-------------|
| **Chunk streaming** | Terrain loads/unloads around the player |
| **Procedural terrain** | Heightmap + trees, rocks, crystals per chunk |
| **Day / night cycle** | Sky, fog, and sun intensity over time |
| **Player controller** | Walk, sprint, jump, stamina, ground snap |
| **Save / load** | LocalStorage session persistence (F5) |
| **Quests** | Quest manager with active / completed states |
| **Inventory** | Stackable items including world materials |
| **Event bus + game state** | Shared engine/UI communication |
| **Minimap + HUD** | Vitals, journal, dev stats |

## Quick Start

```bash
npm install
npm run dev
```

## Scripts

- `npm run dev` — Vite + Electron
- `npm run build` — production renderer build
- `npm run electron` — Electron only
- `npm run dist` — package desktop app

## Controls

| Key | Action |
|-----|--------|
| W A S D / Arrows | Move |
| Shift | Sprint (uses stamina) |
| Space | Jump |
| F5 | Save |
| Esc | Pause / unlock pointer |
| Click canvas | Lock pointer |

## Architecture

```txt
src/
  core/           EventBus, GameState, TimeSystem, SaveSystem
  world/          ChunkManager, TerrainGenerator
  game/           PlayerController, EntityRegistry, QuestManager, inventory, camera
  components/     GameCanvas, InventoryPanel
  data/           worldData, items, scenes, objectLogic
  logic/          dev panel collectors
electron/         main process + preload
```

## Open-world loop

1. Player moves → `PlayerController` updates position + stamina  
2. `ChunkManager` decides which chunks to load/unload  
3. `TerrainGenerator` builds mesh + props for new chunks  
4. `TimeSystem` advances day/night and drives lighting  
5. UI subscribes to `GameState` / quests / inventory  

## Extending

- **NPCs**: `createEntityRegistry().spawn('npc', { position, dialogue })`
- **Quests**: pass definitions into `createQuestManager`
- **New items**: add JSON under `src/data/items/` and import in `gameData.js`
- **Larger world**: raise `loadRadius` in `ChunkManager` (watch perf)

## Security

Electron defaults: `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`.
