# AI Cardinal — Folder structure

```txt
src/
  app/                    # Application shell (routes / root layout later)
  components/
    EngineCore.jsx        # 3D heart (framework-owned)
    FrameworkShell.jsx    # Dashboard around the heart
    GameCanvas.jsx        # Optional open-world demo viewport
    InventoryPanel.jsx
  core/                   # Framework core services
    EventBus.js
    GameState.js
    TimeSystem.js
    SaveSystem.js
  framework/
    createEngine.js       # Public engine factory
  game/                   # Shared gameplay utilities (not a specific title)
    PlayerController.js
    QuestManager.js
    EntityRegistry.js
    inventory.js
    camera.js
  games/                  # Individual games (one folder per title)
    sample-pulse/         # Phase 1 sample game layer
  world/                  # World streaming helpers
  data/                   # Config / JSON content
  logic/
  models/
  styles.css
  main.jsx
  App.jsx                 # Shell: framework vs game layer
electron/
docs/
```

**Rule:** Games under `src/games/*` may import `createEngine` / bus events. They must not import `EngineCore` internals.
