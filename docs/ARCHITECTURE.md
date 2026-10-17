# AI Cardinal — Architecture

## Vision

**AI Cardinal** is a modular, AI-powered **game engine framework** with a living 3D heart as its visual and conceptual core. It is **not** a single game. Games are separate interface layers that attach to the framework.

## Two layers

```
┌─────────────────────────────────────────────────────────┐
│  GAME INTERFACE LAYER                                   │
│  (viewport, HUD, menus, save UI, game-specific logic)   │
│         ▲ attach / detach via public API + EventBus     │
└─────────┼───────────────────────────────────────────────┘
          │  events · state · lifecycle
┌─────────▼───────────────────────────────────────────────┐
│  AI CARDINAL FRAMEWORK                                  │
│  Core · Renderer · Events · State · Assets · AI · …     │
│  3D Heart = visual centre of the runtime                │
└─────────────────────────────────────────────────────────┘
```

### Framework responsibilities
- Lifecycle (boot, ready, shutdown)
- Module registration
- Event bus
- Shared state & persistence hooks
- 3D renderer host (heart + optional game viewport)
- Diagnostics / logs
- Game runtime (load, pause, resume, unload)

### Game interface responsibilities
- Gameplay, content, art direction
- Own HUD and menus
- Consumes framework APIs only — never imports heart internals

## Communication

1. **EventBus** — `core:*`, `layer:*`, `game:*`, `ai:*`, `diag:*`
2. **Engine API** — `createEngine()` returns modules + `attachLayer` / `pulse`
3. **State** — `GameState` snapshots; games patch via API, UI subscribes

Games must not create their own WebGL context for the heart. The framework owns the core scene. A game may request a **viewport surface** from the runtime for its own scene.

## Module map (target)

| Module | Role |
|--------|------|
| Cardinal Core | Init, config, module registry |
| Cardinal Renderer | Three.js scenes, heart, cameras |
| Cardinal Event System | Pub/sub |
| Cardinal State | Engine + session state |
| Cardinal AI | Provider-agnostic AI interface |
| Cardinal Assets | Models, textures, audio |
| Cardinal Audio | SFX / heartbeat / music |
| Cardinal UI | Shell, panels, overlays |
| Cardinal Game Runtime | Load / pause / unload games |
| Cardinal Plugins | Extension points |
| Cardinal Diagnostics | Logs, FPS, errors |

## Phase status

- **Phase 1 (this branch):** Heart + dashboard + sample game layer via bus
- **Phase 2:** Full module registry + diagnostics service
- **Phase 3:** Richer sample game + runtime controls
- **Phase 4:** AI provider interface (demo mode without keys)
- **Phase 5:** Assets / plugins
- **Phase 6:** Tests, hardening, deploy docs

## Native path

React + Three.js is the **authoring and prototype runtime**. Public module interfaces should stay renderer-agnostic where possible so a future native (e.g. C++) backend can implement the same contracts.
