import sceneManifest from '../data/scenes/scenes.json';
import starterValley from '../data/scenes/starter-valley.json';
import crystalGate from '../data/scenes/crystal-gate.json';
import mysticHills from '../data/scenes/mystic-hills.json';
import mapConfig from '../data/mapConfig.json';

const sceneRegistry = {
  'starter-valley': starterValley,
  'crystal-gate': crystalGate, 
  'mystic-hills': mysticHills
};

const cloneCompletionState = () => ({ ...mapConfig.completion });

export function loadScene(sceneName = sceneManifest.defaultScene) {
  const selectedScene = sceneRegistry[sceneName];

  if (!selectedScene) {
    throw new Error(`Scene '${sceneName}' is not registered in sceneLoader.js`);
  }

  return selectedScene;
}

export function listScenes() {
  return Object.keys(sceneManifest.scenes);
}

export function getDefaultSceneName() {
  return mapConfig.defaultScene ?? sceneManifest.defaultScene;
}

export function getPortalsForScene(sceneName) {
  return mapConfig.portals[sceneName] ?? [];
}

export function getNextSceneName(currentSceneName, completionState = cloneCompletionState()) {
  const sceneOrder = mapConfig.sceneOrder ?? listScenes();
  const currentIndex = sceneOrder.indexOf(currentSceneName);

  if (currentIndex === -1) return null;

  for (let idx = currentIndex + 1; idx < sceneOrder.length; idx += 1) {
    const candidate = sceneOrder[idx];
    if (!completionState[candidate]) {
      return candidate;
    }
  }

  return null;
}

export function createSceneCompletionState() {
  return cloneCompletionState();
}
