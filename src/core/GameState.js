/**
 * Central mutable game state snapshot + subscribe API.
 */
export function createGameState(initial = {}) {
  let state = {
    player: {
      position: { x: 0, y: 1.6, z: 0 },
      rotation: { y: 0 },
      health: 120,
      maxHealth: 120,
      stamina: 110,
      maxStamina: 110,
      magicka: 90,
      maxMagicka: 90,
      isSprinting: false,
      isGrounded: true
    },
    world: {
      chunkX: 0,
      chunkZ: 0,
      loadedChunks: []
    },
    time: {
      hours: 8,
      dayLengthSeconds: 600,
      phase: 'day'
    },
    flags: {},
    ...initial
  };

  const subscribers = new Set();

  const notify = () => {
    const snapshot = getSnapshot();
    subscribers.forEach((fn) => fn(snapshot));
  };

  const getSnapshot = () => structuredClone(state);

  return {
    getSnapshot,

    subscribe(fn) {
      subscribers.add(fn);
      return () => subscribers.delete(fn);
    },

    patch(partial) {
      state = {
        ...state,
        ...partial,
        player: { ...state.player, ...(partial.player || {}) },
        world: { ...state.world, ...(partial.world || {}) },
        time: { ...state.time, ...(partial.time || {}) },
        flags: { ...state.flags, ...(partial.flags || {}) }
      };
      notify();
      return getSnapshot();
    },

    setPlayer(partial) {
      return this.patch({ player: partial });
    },

    setFlag(key, value = true) {
      return this.patch({ flags: { [key]: value } });
    },

    getFlag(key) {
      return Boolean(state.flags[key]);
    }
  };
}
