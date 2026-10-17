import { useCallback, useEffect, useMemo, useState } from 'react';
import FrameworkShell from './components/FrameworkShell';
import SamplePulseGame from './games/sample-pulse/SamplePulseGame';
import { createEngine } from './framework/createEngine';

function stamp() {
  return new Date().toLocaleTimeString();
}

/**
 * AI Cardinal application shell.
 * layer = 'framework' | 'game'
 */
export default function App() {
  const engine = useMemo(() => createEngine(), []);
  const [layer, setLayer] = useState('framework');
  const [coreStatus, setCoreStatus] = useState('idle');
  const [activity, setActivity] = useState(0);
  const [logs, setLogs] = useState(() => [
    { at: stamp(), message: 'Cardinal Core online — modules registered.' }
  ]);
  const [activeNav, setActiveNav] = useState('core');
  const [score, setScore] = useState(0);
  const [running, setRunning] = useState(true);

  const pushLog = useCallback((message) => {
    setLogs((prev) => [{ at: stamp(), message }, ...prev].slice(0, 40));
  }, []);

  useEffect(() => {
    const offReady = engine.bus.on('core:ready', () => pushLog('EventBus: core:ready'));
    const offPulse = engine.bus.on('core:pulse', () => pushLog('EventBus: core:pulse'));
    const offAttach = engine.bus.on('layer:attach', (p) => pushLog(`Layer attached: ${p?.name}`));
    const offDetach = engine.bus.on('layer:detach', (p) => pushLog(`Layer detached: ${p?.name}`));
    return () => {
      offReady();
      offPulse();
      offAttach();
      offDetach();
    };
  }, [engine, pushLog]);

  const simulatePulse = () => {
    setCoreStatus('active');
    setActivity(0.85);
    engine.pulse({ source: 'dashboard' });
    pushLog('Simulated engine pulse (no AI API).');
    window.setTimeout(() => {
      setActivity(0.2);
      setCoreStatus('idle');
    }, 900);
  };

  const simulateProcess = () => {
    setCoreStatus('processing');
    setActivity(0.6);
    pushLog('Simulated AI activity (demo mode — no external model).');
    window.setTimeout(() => {
      setCoreStatus('idle');
      setActivity(0.15);
      pushLog('Processing cycle complete.');
    }, 1600);
  };

  const launchSampleGame = () => {
    engine.attachLayer('sample-pulse', { kind: 'game' });
    setLayer('game');
    setRunning(true);
    setCoreStatus('active');
    pushLog('Sample Pulse game layer launched.');
  };

  const exitGame = () => {
    engine.bus.emit('layer:detach', { name: 'sample-pulse' });
    setLayer('framework');
    setCoreStatus('idle');
    setActivity(0.1);
    pushLog('Returned to framework shell.');
  };

  const relayPulse = () => {
    if (!running) return;
    setScore((s) => s + 1);
    engine.pulse({ source: 'sample-pulse' });
    setCoreStatus('active');
    setActivity(1);
    pushLog('Game → core: pulse relayed.');
    window.setTimeout(() => setActivity(0.25), 700);
  };

  if (layer === 'game') {
    return (
      <SamplePulseGame
        engineStatus={coreStatus}
        score={score}
        running={running}
        onPulseCore={relayPulse}
        onPause={() => {
          setRunning(false);
          pushLog('Game paused via runtime control.');
        }}
        onResume={() => {
          setRunning(true);
          pushLog('Game resumed.');
        }}
        onExit={exitGame}
      />
    );
  }

  return (
    <FrameworkShell
      coreStatus={coreStatus}
      activity={activity}
      logs={logs}
      activeNav={activeNav}
      onNav={setActiveNav}
      onSimulatePulse={simulatePulse}
      onSimulateProcess={simulateProcess}
      onLaunchSampleGame={launchSampleGame}
      onSetCoreStatus={setCoreStatus}
    />
  );
}
