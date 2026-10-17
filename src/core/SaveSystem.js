const SAVE_KEY = 'nwo-framework-save-v1';

/**
 * LocalStorage save / load for open-world sessions.
 */
export function createSaveSystem() {
  return {
    save(payload) {
      const data = {
        version: 1,
        savedAt: new Date().toISOString(),
        ...payload
      };
      try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(data));
        return { ok: true, data };
      } catch (err) {
        console.error('[SaveSystem] save failed', err);
        return { ok: false, error: err.message };
      }
    },

    load() {
      try {
        const raw = localStorage.getItem(SAVE_KEY);
        if (!raw) return { ok: false, error: 'No save found' };
        return { ok: true, data: JSON.parse(raw) };
      } catch (err) {
        return { ok: false, error: err.message };
      }
    },

    clear() {
      localStorage.removeItem(SAVE_KEY);
    },

    hasSave() {
      return Boolean(localStorage.getItem(SAVE_KEY));
    }
  };
}
