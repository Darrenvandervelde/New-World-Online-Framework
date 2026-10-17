import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { createCamera, resizeCamera } from '../game/camera';
import { createPlayerController } from '../game/PlayerController';
import { createChunkManager } from '../world/ChunkManager';
import { createChunkMesh, createWorldProps, heightAt } from '../world/TerrainGenerator';
import { createTimeSystem } from '../core/TimeSystem';
import { createDevPanelCollector } from '../logic/devPanelLogic';
import { createDevPanelSnapshot } from '../models/devPanelModel';

const MOVE_KEYS = [
  'W / ↑ — Forward',
  'S / ↓ — Back',
  'A / ← — Left',
  'D / → — Right',
  'Space — Jump',
  'Shift — Sprint',
  'F5 — Save',
  'Esc — Pause / unlock'
];

export default function GameCanvas({
  inventory,
  onEscape,
  onPlayerUpdate,
  onTimeUpdate,
  onSaveRequest,
  spawn = { x: 8, y: 1.7, z: 8 }
}) {
  const mountRef = useRef(null);
  const [devStats, setDevStats] = useState(() => createDevPanelSnapshot());
  const [hud, setHud] = useState({
    x: spawn.x,
    y: spawn.y,
    z: spawn.z,
    stamina: 110,
    maxStamina: 110,
    phase: 'day',
    hours: 8,
    chunks: 0,
    message: 'Click canvas to lock pointer'
  });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x87b5ff, 0.012);

    const camera = createCamera(mount.clientWidth, mount.clientHeight);
    const ground = heightAt(spawn.x, spawn.z);
    camera.position.set(spawn.x, ground + 1.7, spawn.z);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.shadowMap.enabled = true;
    mount.appendChild(renderer.domElement);

    const controls = new PointerLockControls(camera, renderer.domElement);
    const player = createPlayerController({ camera, controls });

    const hemi = new THREE.HemisphereLight(0xbcd4ff, 0x1f2937, 0.55);
    scene.add(hemi);

    const sun = new THREE.DirectionalLight(0xffffff, 1.2);
    sun.position.set(40, 60, 20);
    sun.castShadow = true;
    scene.add(sun);

    const ambient = new THREE.AmbientLight(0x334155, 0.25);
    scene.add(ambient);

    // Origin marker
    const marker = new THREE.Mesh(
      new THREE.CylinderGeometry(0.4, 0.5, 0.2, 12),
      new THREE.MeshStandardMaterial({ color: '#f59e0b', emissive: '#b45309', emissiveIntensity: 0.3 })
    );
    marker.position.set(0, heightAt(0, 0) + 0.1, 0);
    scene.add(marker);

    const chunkManager = createChunkManager({ chunkSize: 64, loadRadius: 2 });
    const chunkRoot = new THREE.Group();
    scene.add(chunkRoot);

    const timeSystem = createTimeSystem({
      startHours: 8,
      dayLengthSeconds: 480
    });

    const clock = new THREE.Clock();
    const devCollector = createDevPanelCollector(renderer);
    let animationId;
    let message = 'Click canvas to explore the open world';

    const loadChunk = (cx, cz) => {
      const terrain = createChunkMesh(cx, cz, 64, 20);
      const props = createWorldProps(cx, cz, 64, 7);
      const group = new THREE.Group();
      group.add(terrain, props);
      chunkRoot.add(group);
      chunkManager.markLoaded(cx, cz, { group, terrain, props });
    };

    const unloadChunk = ({ data }) => {
      if (!data?.group) return;
      chunkRoot.remove(data.group);
      data.group.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
          else obj.material.dispose();
        }
      });
    };

    // Initial chunks
    const initial = chunkManager.update(camera.position.x, camera.position.z);
    initial.toLoad.forEach(({ cx, cz }) => loadChunk(cx, cz));
    setReady(true);

    const render = () => {
      const delta = Math.min(clock.getDelta(), 0.05);
      const playerSnap = player.update(delta);
      const timeSnap = timeSystem.update(delta);

      scene.background = new THREE.Color(timeSnap.skyColor);
      scene.fog.color.set(timeSnap.skyColor);
      sun.intensity = timeSnap.sunIntensity;
      hemi.intensity = timeSnap.phase === 'night' ? 0.2 : 0.55;

      // Sun path
      const t = (timeSnap.hours / 24) * Math.PI * 2;
      sun.position.set(Math.cos(t) * 80, Math.sin(t) * 60 + 20, Math.sin(t * 0.5) * 40);

      const stream = chunkManager.update(playerSnap.position.x, playerSnap.position.z);
      stream.toLoad.forEach(({ cx, cz }) => loadChunk(cx, cz));
      stream.toUnload.forEach(unloadChunk);

      // Collect nearby crystals
      chunkRoot.traverse((obj) => {
        if (!obj.userData?.collectible || obj.userData.picked) return;
        const wp = new THREE.Vector3();
        obj.getWorldPosition(wp);
        if (wp.distanceTo(camera.position) < 2.2) {
          obj.userData.picked = true;
          obj.visible = false;
          inventory?.addItem?.('crystal-shard', 1);
          message = 'Collected crystal shard';
        }
      });

      renderer.render(scene, camera);

      const hudState = {
        ...playerSnap.position,
        stamina: playerSnap.stamina,
        maxStamina: playerSnap.maxStamina,
        phase: timeSnap.phase,
        hours: timeSnap.hours,
        chunks: stream.loadedCount + stream.toLoad.length,
        message
      };
      setHud(hudState);
      onPlayerUpdate?.(playerSnap);
      onTimeUpdate?.(timeSnap);

      const stats = devCollector.collect(delta);
      if (stats) setDevStats(stats);

      animationId = requestAnimationFrame(render);
    };

    const onClick = () => controls.lock();
    const onResize = () => {
      resizeCamera(camera, mount.clientWidth, mount.clientHeight);
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    const onKeyDown = (e) => {
      player.onKeyDown(e.code);
      if (e.code === 'F5') {
        e.preventDefault();
        onSaveRequest?.();
        message = 'Game saved';
      }
      if (e.key === 'Escape') onEscape?.();
    };
    const onKeyUp = (e) => player.onKeyUp(e.code);

    renderer.domElement.addEventListener('click', onClick);
    window.addEventListener('resize', onResize);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    render();

    return () => {
      cancelAnimationFrame(animationId);
      renderer.domElement.removeEventListener('click', onClick);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      player.resetKeys();
      chunkManager.clear();
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, [inventory, onEscape, onPlayerUpdate, onSaveRequest, onTimeUpdate, spawn.x, spawn.y, spawn.z]);

  return (
    <>
      <div className="game-canvas" ref={mountRef} style={{ visibility: ready ? 'visible' : 'hidden' }} />
      {!ready && (
        <div className="popup-overlay" role="status">
          <div className="popup-card">
            <h2>Generating open world</h2>
            <p>Streaming terrain chunks around the player...</p>
          </div>
        </div>
      )}

      <aside className="minimap-panel" aria-label="Minimap">
        <h3>World</h3>
        <div className="minimap-grid">
          <div
            className="minimap-player"
            style={{
              left: `${50 + (hud.x % 64) * 0.4}%`,
              top: `${50 + (hud.z % 64) * 0.4}%`
            }}
          />
        </div>
        <p className="muted">Chunks loaded: {hud.chunks}</p>
      </aside>

      <aside className="dev-panel" aria-label="Developer panel">
        <h3>Dev / Open World</h3>
        <p>FPS: {devStats.fps}</p>
        <p>Frame: {devStats.frameTimeMs} ms</p>
        <p>Draw calls: {devStats.drawCalls}</p>
        <p>Time: {hud.hours?.toFixed?.(1) ?? hud.hours}h ({hud.phase})</p>
        <p>
          Pos: {hud.x?.toFixed?.(1)}, {hud.y?.toFixed?.(1)}, {hud.z?.toFixed?.(1)}
        </p>
      </aside>

      <aside className="settings-panel" aria-label="Controls">
        <h3>Controls</h3>
        <ul>
          {MOVE_KEYS.map((k) => (
            <li key={k}>{k}</li>
          ))}
        </ul>
        <p>{hud.message}</p>
      </aside>
    </>
  );
}
