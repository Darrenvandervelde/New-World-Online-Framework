/**
 * Simple entity store for NPCs, interactables, and world markers.
 */
export function createEntityRegistry() {
  const entities = new Map();
  let nextId = 1;

  return {
    spawn(type, data = {}) {
      const id = data.id || `ent-${nextId++}`;
      const entity = {
        id,
        type,
        position: data.position || { x: 0, y: 0, z: 0 },
        active: true,
        ...data
      };
      entities.set(id, entity);
      return entity;
    },

    remove(id) {
      return entities.delete(id);
    },

    get(id) {
      return entities.get(id) || null;
    },

    all() {
      return Array.from(entities.values());
    },

    byType(type) {
      return this.all().filter((e) => e.type === type && e.active);
    },

    nearby(x, z, radius = 8, type) {
      const r2 = radius * radius;
      return this.all().filter((e) => {
        if (!e.active) return false;
        if (type && e.type !== type) return false;
        const dx = (e.position?.x ?? 0) - x;
        const dz = (e.position?.z ?? 0) - z;
        return dx * dx + dz * dz <= r2;
      });
    },

    clear() {
      entities.clear();
    }
  };
}
