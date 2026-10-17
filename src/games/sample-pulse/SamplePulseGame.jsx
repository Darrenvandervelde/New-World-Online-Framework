/**
 * Sample game interface layer for AI Cardinal.
 * Communicates ONLY through the engine API / callbacks — not EngineCore.
 */
export default function SamplePulseGame({
  engineStatus,
  onPulseCore,
  onPause,
  onResume,
  onExit,
  score,
  running
}) {
  return (
    <div className="sample-game-layer">
      <header className="sample-game-header">
        <div>
          <p className="eyebrow">Game layer · Sample Pulse</p>
          <h1>Pulse Relay</h1>
          <p className="muted">
            Demo title attached to AI Cardinal. Score increases when you relay a pulse into the core.
          </p>
        </div>
        <button type="button" className="hud-btn" onClick={onExit}>
          Exit to framework
        </button>
      </header>

      <div className="sample-game-viewport glass-panel">
        <p className="viewport-label">Game viewport (placeholder surface)</p>
        <div className="pulse-arena" aria-label="Sample game playfield">
          <p className="score">Score: {score}</p>
          <p className="muted">Core reports: {engineStatus}</p>
          <p className="muted">{running ? 'Running' : 'Paused'}</p>
          <div className="menu-actions">
            <button type="button" className="primary-btn" onClick={onPulseCore}>
              Relay pulse to core
            </button>
            {running ? (
              <button type="button" className="hud-btn" onClick={onPause}>Pause</button>
            ) : (
              <button type="button" className="hud-btn" onClick={onResume}>Resume</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
