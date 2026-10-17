/**
 * Tracks quest definitions, active stages, and completion.
 */
export function createQuestManager(initialQuests = []) {
  const quests = new Map(
    initialQuests.map((q) => [
      q.id,
      {
        ...q,
        status: q.status || 'Available',
        progress: q.progress || 0,
        objectives: q.objectives || []
      }
    ])
  );

  const listeners = new Set();

  const notify = () => {
    const list = thisSnapshot();
    listeners.forEach((fn) => fn(list));
  };

  const thisSnapshot = () => Array.from(quests.values()).map((q) => ({ ...q }));

  return {
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },

    list() {
      return thisSnapshot();
    },

    get(id) {
      return quests.get(id) || null;
    },

    start(id) {
      const q = quests.get(id);
      if (!q) return null;
      q.status = 'Active';
      notify();
      return { ...q };
    },

    advance(id, amount = 1) {
      const q = quests.get(id);
      if (!q || q.status !== 'Active') return null;
      q.progress += amount;
      const needed = q.objectives?.length || 1;
      if (q.progress >= needed) {
        q.status = 'Completed';
        q.progress = needed;
      }
      notify();
      return { ...q };
    },

    complete(id) {
      const q = quests.get(id);
      if (!q) return null;
      q.status = 'Completed';
      notify();
      return { ...q };
    },

    active() {
      return thisSnapshot().filter((q) => q.status === 'Active');
    }
  };
}
