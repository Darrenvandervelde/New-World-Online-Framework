import { useCallback, useEffect, useMemo, useState } from 'react';
import GameCanvas from './components/GameCanvas';
import InventoryPanel from './components/InventoryPanel';
import worldData from './data/worldData.json';
import { gameData } from './data/gameData';
import { createInventory } from './game/inventory';
import { createGameState } from './core/GameState';
import { createSaveSystem } from './core/SaveSystem';
import { createQuestManager } from './game/QuestManager';
import { createEventBus } from './core/EventBus';

export default function App() {
  const bus = useMemo(() => createEventBus(), []);
  const gameState = useMemo(() => createGameState({
    player: {
      health: worldData.player.attributes.health,
      maxHealth: worldData.player.attributes.health,
      stamina: worldData.player.attributes.stamina,
      maxStamina: worldData.player.attributes.stamina,
      magicka: worldData.player.attributes.magicka,
      maxMagicka: worldData.player.attributes.magicka
    }
  }), []);
  const saveSystem = useMemo(() => createSaveSystem(), []);
  const quests = useMemo(() => createQuestManager(worldData.quests), []);
  const inventory = useMemo(() => createInventory(gameData.inventoryItems), []);

  const [inventoryState, setInventoryState] = useState(() => inventory.getSnapshot());
  const [questList, setQuestList] = useState(() => quests.list());
  const [stateSnap, setStateSnap] = useState(() => gameState.getSnapshot());
  const [timePhase, setTimePhase] = useState('day');
  const [timeHours, setTimeHours] = useState(8);
  const [screen, setScreen] = useState('menu');
  const [showInventory, setShowInventory] = useState(false);
  const [showPauseMenu, setShowPauseMenu] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => inventory.subscribe(setInventoryState), [inventory]);
  useEffect(() => quests.subscribe(setQuestList), [quests]);
  useEffect(() => gameState.subscribe(setStateSnap), [gameState]);

  const currentHealth = stateSnap.player.health;
  const maxHealth = stateSnap.player.maxHealth;
  const stamina = stateSnap.player.stamina;
  const maxStamina = stateSnap.player.maxStamina;
  const healthPct = Math.max(0, Math.min(100, (currentHealth / maxHealth) * 100));
  const staminaPct = Math.max(0, Math.min(100, (stamina / maxStamina) * 100));

  const flash = useCallback((msg) => {
    setToast(msg);
    window.setTimeout(() => setToast(''), 2200);
  }, []);

  const handlePlayerUpdate = useCallback((playerSnap) => {
    gameState.setPlayer({
      position: playerSnap.position,
      stamina: playerSnap.stamina,
      maxStamina: playerSnap.maxStamina,
      isSprinting: playerSnap.isSprinting,
      isGrounded: playerSnap.isGrounded
    });
  }, [gameState]);

  const handleTimeUpdate = useCallback((timeSnap) => {
    setTimePhase(timeSnap.phase);
    setTimeHours(timeSnap.hours);
    gameState.patch({ time: { hours: timeSnap.hours, phase: timeSnap.phase } });
  }, [gameState]);

  const handleSave = useCallback(() => {
    const result = saveSystem.save({
      player: gameState.getSnapshot().player,
      inventory: inventory.getSnapshot(),
      quests: quests.list(),
      time: { hours: timeHours, phase: timePhase }
    });
    flash(result.ok ? 'World saved' : `Save failed: ${result.error}`);
    bus.emit('save', result);
  }, [bus, flash, gameState, inventory, quests, saveSystem, timeHours, timePhase]);

  const handleLoad = useCallback(() => {
    const result = saveSystem.load();
    if (!result.ok) {
      flash(result.error || 'No save found');
      return;
    }
    if (result.data.player) gameState.setPlayer(result.data.player);
    flash('Save loaded (position applies next session spawn)');
    bus.emit('load', result.data);
  }, [bus, flash, gameState, saveSystem]);

  const startGame = (useSave = false) => {
    if (useSave) handleLoad();
    setScreen('game');
    setShowInventory(false);
    setShowPauseMenu(false);
    quests.start('main-awakening');
  };

  const exitToMenu = () => {
    setScreen('menu');
    setShowInventory(false);
    setShowPauseMenu(false);
  };

  if (screen === 'menu') {
    return (
      <main className="menu-screen">
        <div className="menu-card">
          <p className="eyebrow">Open World Framework</p>
          <h1>New World Online</h1>
          <p>Explore a streamed open world with day/night, stamina, quests, and save/load.</p>
          <div className="menu-actions">
            <button type="button" className="primary-btn" onClick={() => startGame(false)}>
              Enter World
            </button>
            {saveSystem.hasSave() && (
              <button type="button" className="hud-btn" onClick={() => startGame(true)}>
                Continue Save
              </button>
            )}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="game-screen">
      <GameCanvas
        inventory={inventory}
        spawn={worldData.player.spawn}
        onEscape={() => setShowPauseMenu((v) => !v)}
        onPlayerUpdate={handlePlayerUpdate}
        onTimeUpdate={handleTimeUpdate}
        onSaveRequest={handleSave}
      />

      <aside className="healthbar-panel" aria-label="Vitals">
        <h3>Vitals</h3>
        <div className="bar-label">Health</div>
        <div className="healthbar-track">
          <div className="healthbar-fill" style={{ width: `${healthPct}%` }} />
        </div>
        <p>{Math.round(currentHealth)} / {maxHealth}</p>
        <div className="bar-label">Stamina</div>
        <div className="staminabar-track">
          <div className="staminabar-fill" style={{ width: `${staminaPct}%` }} />
        </div>
        <p>{Math.round(stamina)} / {maxStamina}</p>
        <p className="muted">Time: {timeHours.toFixed(1)}h · {timePhase}</p>
        <button type="button" className="hud-btn" onClick={() => gameState.setPlayer({ health: Math.max(0, currentHealth - 15) })}>
          Take Damage
        </button>
      </aside>

      <div className="game-hud">
        <button type="button" className="hud-btn" onClick={() => setShowInventory((v) => !v)}>
          {showInventory ? 'Close Inventory' : 'Inventory'}
        </button>
        <button type="button" className="hud-btn" onClick={handleSave}>Save (F5)</button>
        <button type="button" className="hud-btn" onClick={() => setShowPauseMenu(true)}>Menu</button>
      </div>

      <aside className="journal-panel" aria-label="Adventure journal">
        <h3>Journal</h3>
        <p>Build: {worldData.player.archetype}</p>
        <div className="journal-section">
          <h4>Active Quests</h4>
          <ul>
            {questList.filter((q) => q.status === 'Active' || q.status === 'Completed').map((quest) => (
              <li key={quest.id}>
                <strong>{quest.title}</strong> — {quest.status}
                <br />
                <span className="muted">{quest.stage}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="journal-section">
          <h4>Skills</h4>
          <ul>
            {worldData.player.skills.map((skill) => (
              <li key={skill.id}>{skill.name} ({skill.level})</li>
            ))}
          </ul>
        </div>
      </aside>

      {toast && <div className="toast">{toast}</div>}

      {showInventory && (
        <div className="popup-overlay" role="dialog" aria-modal="true">
          <div className="popup-card">
            <div className="popup-header">
              <h2>Inventory</h2>
              <button type="button" className="hud-btn" onClick={() => setShowInventory(false)}>Close</button>
            </div>
            <InventoryPanel items={inventoryState.slots} />
          </div>
        </div>
      )}

      {showPauseMenu && (
        <div className="popup-overlay" role="dialog" aria-modal="true">
          <div className="popup-card exit-menu-card">
            <h2>Paused</h2>
            <p>Open world session — save before leaving if needed.</p>
            <div className="menu-actions">
              <button type="button" className="primary-btn" onClick={handleSave}>Save Game</button>
              <button type="button" className="hud-btn" onClick={() => setShowPauseMenu(false)}>Resume</button>
              <button type="button" className="hud-btn" onClick={exitToMenu}>Exit to Menu</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
