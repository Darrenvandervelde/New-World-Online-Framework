import { createDevPanelSnapshot } from '../models/devPanelModel';

export function createDevPanelCollector(renderer, publishIntervalMs = 250) {
  let frames = 0;
  let frameTimeAccumulator = 0;
  let lastPublishTime = performance.now();

  return {
    collect(deltaSeconds) {
      frames += 1;
      frameTimeAccumulator += deltaSeconds * 1000;

      const now = performance.now();
      if (now - lastPublishTime < publishIntervalMs) return null;

      const elapsedMs = now - lastPublishTime;
      const fps = elapsedMs > 0 ? Math.round((frames / elapsedMs) * 1000) : 0;
      const frameTimeMs = frames > 0 ? Number((frameTimeAccumulator / frames).toFixed(2)) : 0;

      const snapshot = createDevPanelSnapshot({
        fps,
        frameTimeMs,
        drawCalls: renderer.info.render.calls,
        triangles: renderer.info.render.triangles,
        points: renderer.info.render.points,
        lines: renderer.info.render.lines,
        geometries: renderer.info.memory.geometries,
        textures: renderer.info.memory.textures
      });

      frames = 0;
      frameTimeAccumulator = 0;
      lastPublishTime = now;

      return snapshot;
    }
  };
}
