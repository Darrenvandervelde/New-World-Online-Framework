import EngineCore from './EngineCore';

const MODULES = [
  { id: 'event-bus', name: 'Event Bus', desc: 'Pub/sub between core and layers' },
  { id: 'game-state', name: 'Game State', desc: 'Shared snapshot for UI + systems' },
  { id: 'time', name: 'Time System', desc: 'Clock / day-night hooks' },
  { id: 'save', name: 'Save System', desc: 'Session persistence API' },
  { id: 'world', name: 'World / Chunks', desc: 'Streaming world interface' },
  { id: 'player', name: 'Player Controller', desc: 'Input + locomotion contract' },
  { id: 'quests', name: 'Quest Manager', desc: 'Objective pipeline' },
  { id: 'entities', name: 'Entity Registry', desc: 'Spawn / query world entities' }
];

/**
 * Framework interface around the 3D heart core.
 * This is the AI Cardinal / NWO engine shell — not the game itself.
 */
export default function FrameworkShell({
  coreStatus = 'online',
  activeLayer = 'framework',
  onOpenGameLayer,
  onStayFramework
}) {
  return (
    <div className="framework-shell">
      <header className="framework-header">
        <div>
          <p className="eyebrow">AI Cardinal · Engine Framework</p>
          <h1>New World Online Core</h1>
          <p className="lede">
            3D heart is the runtime core. Game interfaces mount on top through the module bus.
          </p>
        </div>
        <div className="core-status">
          <span className={`status-dot ${coreStatus}`} />
          Core {coreStatus}
        </div>
      </header>

      <div className="framework-grid">
        <section className="core-stage" aria-label="Engine core">
          <EngineCore status={coreStatus} pulseRate={1.1} />
          <p className="core-caption">Runtime heart · systems pulse through this core</p>
        </section>

        <section className="module-panel" aria-label="Framework modules">
          <h2>Framework modules</h2>
          <ul className="module-list">
            {MODULES.map((m) => (
              <li key={m.id}>
                <strong>{m.name}</strong>
                <span>{m.desc}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="layer-panel" aria-label="Interface layers">
          <h2>Interface layers</h2>
          <p className="muted">
            Active layer: <strong>{activeLayer}</strong>
          </p>
          <div className="layer-actions">
            <button type="button" className="primary-btn" onClick={onOpenGameLayer}>
              Attach game interface
            </button>
            <button type="button" className="hud-btn" onClick={onStayFramework}>
              Stay on framework
            </button>
          </div>
          <ol className="layer-steps">
            <li>Core boots (heart + EventBus)</li>
            <li>Modules register on the bus</li>
            <li>Game UI connects as a consumer layer</li>
          </ol>
        </section>
      </div>
    </div>
  );
}
