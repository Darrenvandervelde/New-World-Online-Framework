/**
 * Lightweight pub/sub for engine systems and UI.
 */
export function createEventBus() {
  const listeners = new Map();

  return {
    on(event, handler) {
      if (!listeners.has(event)) listeners.set(event, new Set());
      listeners.get(event).add(handler);
      return () => this.off(event, handler);
    },

    off(event, handler) {
      listeners.get(event)?.delete(handler);
    },

    emit(event, payload) {
      const set = listeners.get(event);
      if (!set) return;
      for (const handler of set) {
        try {
          handler(payload);
        } catch (err) {
          console.error(`[EventBus] handler error for "${event}":`, err);
        }
      }
    },

    clear() {
      listeners.clear();
    }
  };
}
