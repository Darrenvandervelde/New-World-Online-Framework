import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import {
  createSceneCompletionState,
  getDefaultSceneName,
  getNextSceneName,
  getPortalsForScene,
  loadScene
} from '../scenes/sceneLoader';
import modelCatalog from '../data/modelCatalog.json';
import { createCamera, resizeCamera } from '../game/camera';
import { createDevPanelCollector } from '../logic/devPanelLogic';
import { createDevPanelSnapshot } from '../models/devPanelModel';

const MOVE_KEYS = ['W / ArrowUp', 'S / ArrowDown', 'A / ArrowLeft', 'D / ArrowRight', 'Space (Jump)', 'Shift (Sprint)', 'E (Use portal)', 'Esc (Unlock pointer)'];

export default function GameCanvas({ gameData, inventory, onEscape }) {
  const mountRef = useRef(null);
  const [devStats, setDevStats] = useState(() => createDevPanelSnapshot());
  const [playerState, setPlayerState] = useState({ x: 0, y: 1.6, z: 0, canJump: true });
  const [settingMessage, setSettingMessage] = useState('Ready');
  const [sceneReady, setSceneReady] = useState(false);
  const [activeSceneName, setActiveSceneName] = useState(() => getDefaultSceneName());
  const [sceneCompleted, setSceneCompleted] = useState(() => createSceneCompletionState());
  const [portalPrompt, setPortalPrompt] = useState('');
  const sceneConfig = useMemo(() => loadScene(activeSceneName), [activeSceneName]);
  const portals = useMemo(() => getPortalsForScene(activeSceneName), [activeSceneName]);

  const objectLogicById = useMemo(() => {
    const objects = gameData?.objectLogic?.worldObjects ?? [];
    return new Map(objects.map((obj) => [obj.id, obj]));
  }, [gameData]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0b0f17');

    const camera = createCamera(mount.clientWidth, mount.clientHeight);
    camera.position.fromArray(sceneConfig.scene.spawn);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    const controls = new PointerLockControls(camera, renderer.domElement);

    const hemi = new THREE.HemisphereLight(0xbcd4ff, 0x1f2937, 1.2);
    scene.add(hemi);
    const light = new THREE.DirectionalLight(0xffffff, 1.2);
    light.position.set(10, 12, 8);
    scene.add(light);

    const areaMeshes = sceneConfig.areas.map((area) => {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(...area.size),
        new THREE.MeshStandardMaterial({ color: area.color, roughness: 0.9 })
      );
      mesh.position.fromArray(area.position);
      scene.add(mesh);
      return { ...area, mesh };
    });

    const objectsGroup = new THREE.Group();
    scene.add(objectsGroup);
    const gltfLoader = new GLTFLoader();

    let remainingLoads = sceneConfig.objects.length;
    const markLoadDone = () => {
      remainingLoads -= 1;
      if (remainingLoads <= 0) setSceneReady(true);
    };

    if (remainingLoads === 0) {
      setSceneReady(true);
    }

    const collectibleNodes = [];

    sceneConfig.objects.forEach((obj) => {
      const modelDef = modelCatalog.models[obj.modelId];
      if (!modelDef?.gltf) return;
      const logicDef = objectLogicById.get(obj.id);
      const candidateDrop = logicDef?.logic?.lootTable?.[0]?.itemId ?? logicDef?.logic?.onInteract?.drops?.[0]?.itemId ?? null;

      gltfLoader.load(
        modelDef.gltf,
        (gltf) => {
          const model = gltf.scene;
          model.position.fromArray(obj.position);
          model.rotation.set(...obj.rotation);
          model.scale.fromArray(obj.scale);
          objectsGroup.add(model);
          if (candidateDrop) collectibleNodes.push({ id: obj.id, mesh: model, itemId: candidateDrop, picked: false });
          markLoadDone();
        },
        undefined,
        () => {
          const fallback = new THREE.Mesh(
            new THREE.BoxGeometry(1, 1, 1),
            new THREE.MeshStandardMaterial({ color: modelDef.fallbackColor ?? '#f59e0b' })
          );
          fallback.position.fromArray(obj.position);
          objectsGroup.add(fallback);
          if (candidateDrop) collectibleNodes.push({ id: obj.id, mesh: fallback, itemId: candidateDrop, picked: false });
          markLoadDone();
        }
      );
    });

    const clock = new THREE.Clock();
    const devPanelCollector = createDevPanelCollector(renderer);
    const velocity = new THREE.Vector3();
    const direction = new THREE.Vector3();
    const keyState = {};
    let animationId;

    const portalMeshes = portals.map((portal) => {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(...portal.size),
        new THREE.MeshStandardMaterial({ color: '#06b6d4', transparent: true, opacity: 0.35, emissive: '#0891b2', emissiveIntensity: 0.4 })
      );
      mesh.position.fromArray(portal.position);
      scene.add(mesh);
      return { ...portal, mesh };
    });

    let activePortal = null;

    const updateVisibleAreas = () => {
      areaMeshes.forEach((area) => {
        const dist = area.mesh.position.distanceTo(camera.position);
        area.mesh.visible = dist <= sceneConfig.scene.renderDistance;
      });
    };

    const render = () => {
      const delta = clock.getDelta();
      const speed = keyState.ShiftLeft || keyState.ShiftRight ? 8 : 5;

      direction.set(0, 0, 0);
      if (keyState.KeyW || keyState.ArrowUp) direction.z += 1;
      if (keyState.KeyS || keyState.ArrowDown) direction.z -= 1;
      if (keyState.KeyA || keyState.ArrowLeft) direction.x -= 1;
      if (keyState.KeyD || keyState.ArrowRight) direction.x += 1;

      if (direction.lengthSq() > 0) {
        direction.normalize();
        controls.moveRight(direction.x * speed * delta);
        controls.moveForward(direction.z * speed * delta);
      }

      velocity.y -= 18 * delta;
      camera.position.y += velocity.y * delta;
      if (camera.position.y < 1.6) {
        camera.position.y = 1.6;
        velocity.y = 0;
      }

      updateVisibleAreas();

      activePortal = null;
      for (const portal of portalMeshes) {
        const withinX = Math.abs(camera.position.x - portal.mesh.position.x) <= portal.size[0] / 2;
        const withinY = Math.abs(camera.position.y - portal.mesh.position.y) <= portal.size[1] / 2 + 0.8;
        const withinZ = Math.abs(camera.position.z - portal.mesh.position.z) <= portal.size[2] / 2;

        if (withinX && withinY && withinZ) {
          activePortal = portal;
          break;
        }
      }

      collectibleNodes.forEach((node) => {
        if (node.picked) return;
        if (node.mesh.position.distanceTo(camera.position) > 2.1) return;
        const result = inventory?.addItem(node.itemId, 1);
        if (!result || result.added < 1) return;
        node.picked = true;
        node.mesh.visible = false;
        setSettingMessage(`Picked up ${node.itemId}`);
      });

      setPortalPrompt(activePortal ? activePortal.prompt : '');
      renderer.render(scene, camera);

      setPlayerState({ x: camera.position.x, y: camera.position.y, z: camera.position.z, canJump: camera.position.y <= 1.6 });

      const collectedStats = devPanelCollector.collect(delta);
      if (collectedStats) setDevStats(collectedStats);

      animationId = requestAnimationFrame(render);
    };

    const onClickCanvas = () => controls.lock();

    const resize = () => {
      const { clientWidth, clientHeight } = mount;
      resizeCamera(camera, clientWidth, clientHeight);
      renderer.setSize(clientWidth, clientHeight);
    };

    const onKeyDown = (event) => {
      keyState[event.code] = true;
      if (event.code === 'Space' && camera.position.y <= 1.6) velocity.y = 7.5;

      if (event.code === 'KeyE' && activePortal) {
        setSceneCompleted((prev) => {
          const nextState = { ...prev, [activeSceneName]: true };
          return nextState;
        });

        const nextFromCompletion = getNextSceneName(activeSceneName, { ...sceneCompleted, [activeSceneName]: true });
        setActiveSceneName(activePortal.targetScene ?? nextFromCompletion ?? activeSceneName);
        return;
      }

      if (event.key === 'Escape') onEscape?.();
    };

    const onKeyUp = (event) => {
      keyState[event.code] = false;
    };

    renderer.domElement.addEventListener('click', onClickCanvas);
    window.addEventListener('resize', resize);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    render();

    return () => {
      setSceneReady(false);
      cancelAnimationFrame(animationId);
      renderer.domElement.removeEventListener('click', onClickCanvas);
      window.removeEventListener('resize', resize);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      portalMeshes.forEach((portal) => {
        scene.remove(portal.mesh);
        portal.mesh.geometry.dispose();
        portal.mesh.material.dispose();
      });
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, [activeSceneName, inventory, objectLogicById, onEscape, portals, sceneConfig]);

  return (
    <>
      <div className="game-canvas" ref={mountRef} style={{ visibility: sceneReady ? 'visible' : 'hidden' }} />
      {!sceneReady && (
        <div className="popup-overlay" role="status" aria-live="polite" aria-label="Loading world">
          <div className="popup-card">
            <h2>Loading world</h2>
            <p>Objects and logic are on standby until everything is ready.</p>
          </div>
        </div>
      )}
      <aside className="dev-panel" aria-label="Developer panel">
        <h3>Dev Panel</h3>
        <p>Scene: {sceneConfig.scene.name}</p>
        <p>Completed: {sceneCompleted[activeSceneName] ? 'true' : 'false'}</p>
        <p>FPS: {devStats.fps}</p>
        <p>Frame: {devStats.frameTimeMs} ms</p>
        <p>Draw calls: {devStats.drawCalls}</p>
        <p>Inventory defs: {gameData.inventoryItems.length}</p>
        <p>Model defs: {Object.keys(modelCatalog.models).length}</p>
        <p>Object logic defs: {gameData.objectLogic.worldObjects.length}</p>
      </aside>
      <aside className="settings-panel" aria-label="Control settings">
        <h3>Settings / Controls</h3>
        <ul>
          {MOVE_KEYS.map((keyName) => (
            <li key={keyName}>{keyName}</li>
          ))}
        </ul>
        <p>
          Pos: {playerState.x.toFixed(1)}, {playerState.y.toFixed(1)}, {playerState.z.toFixed(1)}
        </p>
        <button type="button" className="hud-btn" onClick={() => setSettingMessage('Graphics preset: Balanced')}>
          Apply RPG Preset
        </button>
        <p>{settingMessage}</p>
        {portalPrompt && <p>{portalPrompt}</p>}
        <p>Interactive objects: {Array.from(objectLogicById.values()).filter((obj) => obj.interactable).length}</p>
      </aside>
    </>
  );
}
