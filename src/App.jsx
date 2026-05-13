import { useMemo, useState } from 'react';
import GameCanvas from './components/GameCanvas';
import InventoryPanel from './components/InventoryPanel';
import worldData from './data/worldData.json';
import { gameData } from './data/gameData';
import { createInventory } from './game/inventory';

export default function App() {
  const inventory = useMemo(() => createInventory(gameData.inventoryItems), []);
  const items = inventory.getItems();

  const [screen, setScreen] = useState('menu');
  const [showInventory, setShowInventory] = useState(false);
  const [showPauseMenu, setShowPauseMenu] = useState(false);
  const [currentHealth, setCurrentHealth] = useState(worldData.player.attributes.health);

  const maxHealth = worldData.player.attributes.health;
  const healthPct = Math.max(0, Math.min(100, (currentHealth / maxHealth) * 100));

  const skillTree = [
    { tier: 'Tier 1', name: 'Guardian Stance', role: 'Unlocks shield posture and +8% block rate.' },
    { tier: 'Tier 1', name: 'Iron Wall', role: 'Adds +120 base defense and lowers stagger chance.' },
    { tier: 'Tier 2', name: 'Counter Guard', role: 'Perfect guard reflects a small portion of damage.' },
    { tier: 'Tier 2', name: 'Bulwark Aura', role: 'Nearby allies take reduced damage while guarding.' },
    { tier: 'Tier 3', name: 'Fortress Core', role: 'Massive defense boost and taunt pulse on activation.' }
  ];

  const startGame = () => {
    setScreen('game');
    setShowInventory(false);
    setShowPauseMenu(false);
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
          <h1>Three.js Game Framework</h1>
          <p>Start your game session from this main menu.</p>
          <button type="button" className="primary-btn" onClick={startGame}>
            Start Game
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="game-screen">
      <GameCanvas gameData={gameData} onEscape={() => setShowPauseMenu((current) => !current)} />

      <aside className="healthbar-panel" aria-label="Health bar">
        <h3>Health</h3>
        <div className="healthbar-track">
          <div className="healthbar-fill" style={{ width: `${healthPct}%` }} />
        </div>
        <p>{Math.round(currentHealth)} / {maxHealth}</p>
        <button type="button" className="hud-btn" onClick={() => setCurrentHealth((value) => Math.max(0, value - 15))}>
          Take Damage
        </button>
      </aside>

      <div className="game-hud">
        <button type="button" className="hud-btn" onClick={() => setShowInventory((current) => !current)}>
          {showInventory ? 'Close Inventory' : 'Open Inventory'}
        </button>
        <button type="button" className="hud-btn" onClick={() => setShowPauseMenu(true)}>
          Exit Menu
        </button>
      </div>

      <aside className="journal-panel" aria-label="Adventure journal">
        <h3>Adventure Journal</h3>
        <p>Build: {worldData.player.archetype}</p>
        <div className="journal-section">
          <h4>Attributes</h4>
          <ul>
            <li>Health: {worldData.player.attributes.health}</li>
            <li>Magicka: {worldData.player.attributes.magicka}</li>
            <li>Stamina: {worldData.player.attributes.stamina}</li>
          </ul>
        </div>
        <div className="journal-section">
          <h4>Active Skills</h4>
          <ul>
            {worldData.player.skills.map((skill) => (
              <li key={skill.id}>{skill.name} ({skill.level})</li>
            ))}
          </ul>
        </div>
        <div className="journal-section">
          <h4>Defense Skill Tree (RPG)</h4>
          <ul>
            {skillTree.map((node) => (
              <li key={node.name}>
                <strong>{node.tier} - {node.name}</strong>: {node.role}
              </li>
            ))}
          </ul>
        </div>
        <div className="journal-section">
          <h4>Quests</h4>
          <ul>
            {worldData.quests.map((quest) => (
              <li key={quest.id}><strong>{quest.title}</strong>: {quest.status}</li>
            ))}
          </ul>
        </div>
      </aside>

      {showInventory && (
        <div className="popup-overlay" role="dialog" aria-modal="true" aria-label="Inventory popup">
          <div className="popup-card">
            <div className="popup-header">
              <h2>Inventory</h2>
              <button type="button" className="hud-btn" onClick={() => setShowInventory(false)}>
                Close
              </button>
            </div>
            <InventoryPanel items={items} />
          </div>
        </div>
      )}

      {showPauseMenu && (
        <div className="popup-overlay" role="dialog" aria-modal="true" aria-label="Exit menu">
          <div className="popup-card exit-menu-card">
            <h2>Exit Menu</h2>
            <p>Do you want to leave the game and return to the main menu?</p>
            <div className="menu-actions">
              <button type="button" className="primary-btn" onClick={exitToMenu}>
                Exit to Main Menu
              </button>
              <button type="button" className="hud-btn" onClick={() => setShowPauseMenu(false)}>
                Continue Game
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
