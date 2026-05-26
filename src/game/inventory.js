const INVENTORY_STORAGE_KEY = 'nwof.inventory.v1';

function clampAmount(amount) {
  const normalized = Number.isFinite(amount) ? Math.floor(amount) : 0;
  return normalized > 0 ? normalized : 0;
}

function createDefinitionMap(definitions = []) {
  return new Map(definitions.map((item) => [item.id, { ...item, maxStack: Math.max(1, item.maxStack ?? item.quantity ?? 1), stackable: item.stackable ?? (item.maxStack ?? item.quantity ?? 1) > 1 }]));
}

function buildSlots(definitionsById, seed = []) {
  const slots = [];

  seed.forEach((entry) => {
    const definition = definitionsById.get(entry.id);
    if (!definition) return;

    const quantity = clampAmount(entry.quantity);
    if (quantity === 0) return;

    slots.push({
      id: `${entry.id}-${slots.length + 1}`,
      itemId: entry.id,
      quantity: Math.min(quantity, definition.maxStack)
    });
  });

  return slots;
}

export function createInventory(definitions = [], options = {}) {
  const { maxSlots = 24, storage = globalThis?.localStorage, storageKey = INVENTORY_STORAGE_KEY } = options;
  const definitionsById = createDefinitionMap(definitions);
  const listeners = new Set();

  const persisted = storage ? JSON.parse(storage.getItem(storageKey) ?? 'null') : null;
  let slots = buildSlots(definitionsById, persisted?.slots?.length ? persisted.slots : definitions);

  const save = () => {
    if (!storage) return;
    storage.setItem(storageKey, JSON.stringify({ slots }));
  };

  const emit = () => {
    save();
    listeners.forEach((listener) => listener(getSnapshot()));
  };

  const getSnapshot = () => ({
    slots: slots.map((slot) => {
      const def = definitionsById.get(slot.itemId);
      return {
        ...slot,
        name: def?.name ?? slot.itemId,
        description: def?.description ?? '',
        maxStack: def?.maxStack ?? 1,
        stackable: def?.stackable ?? false
      };
    }),
    totals: slots.reduce((acc, slot) => {
      acc[slot.itemId] = (acc[slot.itemId] ?? 0) + slot.quantity;
      return acc;
    }, {})
  });

  return {
    subscribe(listener) {
      listeners.add(listener);
      listener(getSnapshot());
      return () => listeners.delete(listener);
    },
    addItem(itemId, amount = 1) {
      const definition = definitionsById.get(itemId);
      if (!definition) return { added: 0, overflow: clampAmount(amount) };

      let remaining = clampAmount(amount);
      if (remaining === 0) return { added: 0, overflow: 0 };

      if (definition.stackable) {
        slots.forEach((slot) => {
          if (remaining === 0 || slot.itemId !== itemId || slot.quantity >= definition.maxStack) return;
          const canTake = Math.min(definition.maxStack - slot.quantity, remaining);
          slot.quantity += canTake;
          remaining -= canTake;
        });
      }

      while (remaining > 0 && slots.length < maxSlots) {
        const quantity = definition.stackable ? Math.min(remaining, definition.maxStack) : 1;
        slots.push({ id: `${itemId}-${Date.now()}-${slots.length}`, itemId, quantity });
        remaining -= quantity;
      }

      emit();
      return { added: clampAmount(amount) - remaining, overflow: remaining };
    },
    removeItem(itemId, amount = 1) {
      let remaining = clampAmount(amount);
      if (remaining === 0) return { removed: 0, missing: 0 };

      slots = slots.map((slot) => {
        if (remaining === 0 || slot.itemId !== itemId) return slot;
        const removed = Math.min(slot.quantity, remaining);
        remaining -= removed;
        return { ...slot, quantity: slot.quantity - removed };
      }).filter((slot) => slot.quantity > 0);

      emit();
      return { removed: clampAmount(amount) - remaining, missing: remaining };
    },
    clear() {
      slots = [];
      emit();
    },
    getSnapshot
  };
}
