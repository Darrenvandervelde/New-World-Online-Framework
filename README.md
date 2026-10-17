# AI Cardinal

**AI-Powered Game Engine Framework and 3D Interactive Interface**

The living **3D heart** is the visual core of the framework. Games attach as **separate interface layers** through the EventBus and `createEngine()` API — they are not hardcoded into the heart.

## Phase 1 (this branch)

- Animated 3D heart (orbit / zoom, heartbeat, vessels, rings, particles)
- Visual states: `idle` · `processing` · `active` · `warning` · `error`
- Framework dashboard (sidebar, toolbar, modules, diagnostics log)
- Sample game layer **Sample Pulse** communicating via the engine bus
- Simulated activity (no external AI key required)

## Quick start

```bash
git checkout feature/open-world-engine
npm install
npm run dev
```

Electron + Vite open the **Command Centre**. Drag the heart to orbit, scroll to zoom.

### Try

1. **Pulse** / **Process** — core reacts; diagnostics log updates  
2. **Launch sample game** — game layer mounts; **Relay pulse** talks to the core  
3. **Exit to framework** — layer detaches cleanly  

## Architecture

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) and [docs/FOLDER_STRUCTURE.md](docs/FOLDER_STRUCTURE.md).

```txt
Game Interface  ──events/API──►  AI Cardinal Framework  ◄──  3D Heart Core
```

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Vite + Electron |
| `npm run build` | Production renderer |
| `npm run dist` | Desktop package |

## Roadmap

| Phase | Focus |
|-------|--------|
| 1 | Heart + dashboard + sample game layer |
| 2 | Module registry, config, diagnostics service |
| 3 | Stronger game runtime + viewport host |
| 4 | Provider-agnostic AI interface (demo without keys) |
| 5 | Assets + plugins |
| 6 | Tests, security, production docs |

## Stack

React · Vite · Electron · Three.js (framework-owned WebGL for the heart)

TypeScript / React Three Fiber can be introduced in Phase 2 without changing the layer split.
