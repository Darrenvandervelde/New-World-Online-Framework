/**
 * Day / night cycle. 0–24 hour clock driven by delta time.
 */
export function createTimeSystem({
  startHours = 8,
  dayLengthSeconds = 600,
  onPhaseChange,
  onTick
} = {}) {
  let hours = startHours;
  let phase = hoursToPhase(hours);

  function hoursToPhase(h) {
    if (h >= 5 && h < 8) return 'dawn';
    if (h >= 8 && h < 18) return 'day';
    if (h >= 18 && h < 20) return 'dusk';
    return 'night';
  }

  function skyColor(h) {
    if (h >= 5 && h < 8) return '#3b4d6b';
    if (h >= 8 && h < 18) return '#87b5ff';
    if (h >= 18 && h < 20) return '#c47b4a';
    return '#050816';
  }

  function sunIntensity(h) {
    if (h >= 6 && h < 18) return 1.2;
    if (h >= 5 && h < 6) return 0.4;
    if (h >= 18 && h < 20) return 0.5;
    return 0.15;
  }

  return {
    update(deltaSeconds) {
      const rate = 24 / dayLengthSeconds;
      hours = (hours + deltaSeconds * rate) % 24;
      const nextPhase = hoursToPhase(hours);
      if (nextPhase !== phase) {
        phase = nextPhase;
        onPhaseChange?.(phase, hours);
      }
      const snapshot = this.getSnapshot();
      onTick?.(snapshot);
      return snapshot;
    },

    getSnapshot() {
      return {
        hours,
        phase,
        skyColor: skyColor(hours),
        sunIntensity: sunIntensity(hours),
        dayLengthSeconds
      };
    },

    setHours(value) {
      hours = ((value % 24) + 24) % 24;
      phase = hoursToPhase(hours);
      return this.getSnapshot();
    }
  };
}
