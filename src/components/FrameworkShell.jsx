import EngineCore from './EngineCore';

const NAV = [
  { id: 'core', label: 'CORE' },
  { id: 'stats', label: 'STATS' },
  { id: 'games', label: 'GAMES' },
  { id: 'ai', label: 'AI' },
  { id: 'diagnostics', label: 'DIAG' }
];

const MODULES = [
  { id: 'core', name: 'Cardinal Core', status: 'online' },
  { id: 'renderer', name: 'Renderer', status: 'online' },
  { id: 'events', name: 'Event Bus', status: 'online' },
  { id: 'state', name: 'State', status: 'online' },
  { id: 'runtime', name: 'Game Runtime', status: 'ready' },
  { id: 'ai', name: 'Cardinal AI', status: 'demo' }
];

/** Holographic command-centre shell inspired by tactical HUD design. */
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
  const activityPct = Math.round(Math.min(1, Math.max(0, activity)) * 100);

  return (
    <div className="holo-shell">
      <div className="holo-frame-line top" />
      <div className="holo-frame-line bottom" />

      <aside className="holo-sidebar">
        <div className="brand">
          <span className="brand-ring" />
          <div>
            <strong>AI CARDINAL</strong>
            <small>ENGINE FRAMEWORK</small>
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
          CORE · {String(coreStatus).toUpperCase()}
        </div>
      </aside>

      <main className="holo-main">
        <header className="holo-toolbar">
          <div>
            <p className="eyebrow">COMMAND CENTRE</p>
            <h1>Particle Core Online</h1>
          </div>
          <div className="toolbar-actions">
            <button type="button" className="holo-btn" onClick={() => onSetCoreStatus?.('idle')}>IDLE</button>
            <button type="button" className="holo-btn" onClick={() => onSimulateProcess?.()}>PROCESS</button>
            <button type="button" className="holo-btn accent" onClick={() => onSimulatePulse?.()}>PULSE</button>
            <button type="button" className="holo-btn primary" onClick={() => onLaunchSampleGame?.()}>
              LAUNCH GAME
            </button>
          </div>
        </header>

        <div className="holo-workspace">
          {/* Left stats column */}
          <section className="holo-col">
            <div className="holo-panel">
              <h2>STATS</h2>
              <div className="stat-bars">
                <div className="stat-row"><span>CPU</span><div className="bar"><i style={{ width: `${40 + activityPct * 0.4}%` }} /></div></div>
                <div className="stat-row"><span>GPU</span><div className="bar"><i style={{ width: `${55 + activityPct * 0.3}%` }} /></div></div>
                <div className="stat-row"><span>BUS</span><div className="bar"><i style={{ width: `${30 + activityPct * 0.5}%` }} /></div></div>
                <div className="stat-row"><span>AI</span><div className="bar"><i style={{ width: `${20 + activityPct * 0.6}%` }} /></div></div>
              </div>
            </div>

            <div className="holo-panel">
              <h2>MODULES</h2>
              <ul className="module-status-list">
                {MODULES.map((m) => (
                  <li key={m.id}>
                    <span>{m.name}</span>
                    <em className={`tag ${m.status}`}>{m.status}</em>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Centre particle core */}
          <section className="holo-core-stage">
            <div className="core-bezel">
              <EngineCore status={coreStatus} pulseRate={coreStatus === 'processing' ? 1.5 : 1} activity={activity} />
            </div>
            <div className="core-footer">
              <span>ORBIT · ZOOM · PARTICLE HEART</span>
              <span className={`pill ${coreStatus}`}>{coreStatus}</span>
            </div>
          </section>

          {/* Right panels */}
          <section className="holo-col">
            <div className="holo-panel">
              <h2>HEAT MAP</h2>
              <div className="heat-map" aria-hidden>
                {Array.from({ length: 36 }).map((_, i) => (
                  <span
                    key={i}
                    style={{
                      opacity: 0.25 + ((i * 17 + activityPct) % 60) / 100,
                      background: i % 7 === 0 ? '#f43f5e' : i % 3 === 0 ? '#22d3ee' : '#0e7490'
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="holo-panel">
              <h2>MATCH TIMELINE</h2>
              <div className="timeline">
                <div className="timeline-line" />
                <span className="node" style={{ left: '8%' }} />
                <span className="node alert" style={{ left: '32%' }} />
                <span className="node" style={{ left: '55%' }} />
                <span className="node active" style={{ left: '78%' }} />
              </div>
              <p className="muted tiny">Framework events · game attach points</p>
            </div>

            <div className="holo-panel">
              <h2>DIAGNOSTICS</h2>
              <div className="diag-log" role="log">
                {logs.length === 0 && <p className="muted">Awaiting events…</p>}
                {logs.slice(0, 8).map((line, i) => (
                  <p key={`${line.at}-${i}`}>
                    <span className="log-time">{line.at}</span>
                    {line.message}
                  </p>
                ))}
              </div>
            </div>

            <div className="holo-panel commend">
              <h2>COMMENDATION</h2>
              <div className="commend-grid">
                {['CORE', 'BUS', 'AI', 'GFX', 'NET', 'SYS'].map((c) => (
                  <span key={c} className="hex">{c}</span>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
