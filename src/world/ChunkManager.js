/**
 * Tracks which world chunks should be loaded around the player.
 */
export function createChunkManager({
  chunkSize = 64,
  loadRadius = 2
} = {}) {
  const loaded = new Map();

  function key(cx, cz) {
    return `${cx},${cz}`;
  }

  function worldToChunk(x, z) {
    return {
      cx: Math.floor(x / chunkSize),
      cz: Math.floor(z / chunkSize)
    };
  }

  return {
    chunkSize,
    loadRadius,

    worldToChunk,

    /**
     * Returns { toLoad: [{cx,cz}], toUnload: [{cx,cz,data}] }
     */
    update(playerX, playerZ) {
      const { cx, cz } = worldToChunk(playerX, playerZ);
      const needed = new Set();

      for (let dx = -loadRadius; dx <= loadRadius; dx++) {
        for (let dz = -loadRadius; dz <= loadRadius; dz++) {
          needed.add(key(cx + dx, cz + dz));
        }
      }

      const toLoad = [];
      const toUnload = [];

      for (const k of needed) {
        if (!loaded.has(k)) {
          const [x, z] = k.split(',').map(Number);
          toLoad.push({ cx: x, cz: z });
        }
      }

      for (const [k, data] of loaded) {
        if (!needed.has(k)) {
          const [x, z] = k.split(',').map(Number);
          toUnload.push({ cx: x, cz: z, data });
          loaded.delete(k);
        }
      }

      return { center: { cx, cz }, toLoad, toUnload, loadedCount: loaded.size };
    },

    markLoaded(cx, cz, data) {
      loaded.set(key(cx, cz), data);
    },

    getLoaded() {
      return Array.from(loaded.entries()).map(([k, data]) => {
        const [cx, cz] = k.split(',').map(Number);
        return { cx, cz, data };
      });
    },

    clear() {
      loaded.clear();
    }
  };
}
