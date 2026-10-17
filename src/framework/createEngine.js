import { createEventBus } from '../core/EventBus';
import { createGameState } from '../core/GameState';
import { createTimeSystem } from '../core/TimeSystem';
import { createSaveSystem } from '../core/SaveSystem';
import { createQuestManager } from '../game/QuestManager';
import { createEntityRegistry } from '../game/EntityRegistry';
import { createChunkManager } from '../world/ChunkManager';

/**
 * Factory for the AI Cardinal / NWO engine framework.
 * Game interfaces call this once, then subscribe / dispatch on the bus.
 */
export function createEngine(options = {}) {
  const bus = createEventBus();
  const state = createGameState(options.initialState);
  const time = createTimeSystem(options.time);
  const save = createSaveSystem();
  const quests = createQuestManager(options.quests || []);
  const entities = createEntityRegistry();
  const chunks = createChunkManager(options.chunks);

  const api = {
    bus,
    state,
    time,
    save,
    quests,
    entities,
    chunks,

    /** Game layer registers itself */
    attachLayer(name, handlers = {}) {
      bus.emit('layer:attach', { name, handlers });
      return () => bus.emit('layer:detach', { name });
    },

    /** Broadcast a framework heartbeat */
    pulse(payload = {}) {
      bus.emit('core:pulse', { at: Date.now(), ...payload });
    },

    getStatus() {
      return {
        core: 'online',
        modules: ['event-bus', 'game-state', 'time', 'save', 'world', 'quests', 'entities'],
        layers: []
      };
    }
  };

  bus.emit('core:ready', api.getStatus());
  return api;
}
