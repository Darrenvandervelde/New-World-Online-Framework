export function createInventory(items = []) {
  const byId = new Map(items.map((item) => [item.id, { ...item }]));

  return {
    getItems() {
      return Array.from(byId.values());
    },
    addItem(itemId, amount = 1) {
      const current = byId.get(itemId);
      if (!current) return false;
      current.quantity += amount;
      return true;
    },
    removeItem(itemId, amount = 1) {
      const current = byId.get(itemId);
      if (!current || current.quantity < amount) return false;
      current.quantity -= amount;
      return true;
    }
  };
}
