import EngineCore from './EngineCore';

const NAV = [
  { id: 'core', label: 'Core' },
  { id: 'modules', label: 'Modules' },
  { id: 'games', label: 'Games' },
  { id: 'ai', label: 'AI (demo)' },
  { id: 'diagnostics', label: 'Diagnostics' }
];

const MODULES = [
  { id: 'core', name: 'Cardinal Core', status: 'online' },
  { id: 'renderer', name: 'Cardinal Renderer', status: 'online' },
  { id: 'events', name: 'Event System', status: 'online' },
  { id: 'state', name: 'State Manager', status: 'online' },
  { id: 'runtime', name: 'Game Runtime', status: 'ready' },
  { id: 'ai', name: 'Cardinal AI', status: 'demo' },
  { id: 'assets', name: 'Asset Manager', status: 'stub' },
  { id: 'plugins', name: 'Plugin System', status: 'stub' }
];

/**
 * AI Cardinal framework dashboard — heart is the centrepiece.
 * Game UI is launched separately; it does not live inside the heart component.
 */
export default function FrameworkShell({
  coreStatus = 'idle',
  activity = 0,
  logs = [],
  activeNav = 'core',
  onNav,
  onSimulatePulse,
  onSimulateProcess,
  onLaunchSampleGame,
  onSetCoreStatus
}) {
  return (
    <div className="cardinal-shell">
      <aside className="cardinal-sidebar" aria-label="Navigation">
        <div className="brand">
          <span className="brand-mark" />
          <div>
            <strong>AI Cardinal</strong>
            <small>Engine Framework</small>
          </div>
        </div>
        <nav>
          {NAV.map((item) => (
            <button
              key={item.id}
              type="button"
              className={activeNav === item.id ? 'nav-item active' : 'nav-item'}
              onClick={() => onNav?.(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-foot">
          <span className={`status-dot ${coreStatus}`} />
          Core · {coreStatus}
        </div>
      </aside>

      <div className="cardinal-main">
        <header className="cardinal-toolbar">
          <div>
            <h1>Command Centre</h1>
            <p className="muted">3D heart core · modular bus · game layers attach on demand</p>
          </div>
          <div className="toolbar-actions">
            <button type="button" className="hud-btn" onClick={() => onSetCoreStatus?.('idle')}>Idle</button>
            <button type="button" className="hud-btn" onClick={() => onSimulateProcess?.()}>Process</button>
            <button type="button" className="hud-btn" onClick={() => onSimulatePulse?.()}>Pulse</button>
            <button type="button" className="primary-btn" onClick={() => onLaunchSampleGame?.()}>
              Launch sample game
            </button>
          </div>
        </header>

        <div className="cardinal-workspace">
          <section className="heart-stage glass-panel">
            <EngineCore status={coreStatus} pulseRate={coreStatus === 'processing' ? 1.6 : 1} activity={activity} />
            <div className="heart-legend">
              <span>Drag to orbit · scroll to zoom</span>
              <span className={`pill ${coreStatus}`}>{coreStatus}</span>
            </div>
          </section>

          <section className="side-stack">
            <div className="glass-panel">
              <h2>Modules</h2>
              <ul className="module-status-list">
                {MODULES.map((m) => (
                  <li key={m.id}>
                    <span>{m.name}</span>
                    <em className={`tag ${m.status}`}>{m.status}</em>
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-panel">
              <h2>Diagnostics</h2>
              <div className="diag-log" role="log" aria-live="polite">
                {logs.length === 0 && <p className="muted">No events yet. Use toolbar actions.</p>}
                {logs.map((line, i) => (
                  <p key={`${line.at}-${i}`}>
                    <span className="log-time">{line.at}</span> {line.message}
                  </p>
                ))}
              </div>
            </div>

            <div className="glass-panel">
              <h2>Game runtime</h2>
              <p className="muted">
                Games connect through <code>createEngine()</code> and the EventBus.
                They never import the heart mesh directly.
              </p>
              <button type="button" className="primary-btn" onClick={() => onLaunchSampleGame?.()}>
                Open sample game layer
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
