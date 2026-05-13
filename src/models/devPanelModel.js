export function createDevPanelSnapshot({ fps = 0, frameTimeMs = 0, drawCalls = 0, triangles = 0, points = 0, lines = 0, geometries = 0, textures = 0 } = {}) {
  return {
    fps,
    frameTimeMs,
    drawCalls,
    triangles,
    points,
    lines,
    geometries,
    textures
  };
}
