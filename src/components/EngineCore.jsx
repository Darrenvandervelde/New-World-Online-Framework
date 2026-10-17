import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/**
 * AI Cardinal core — circular heart made of particles (holographic command style).
 * States: idle | processing | active | warning | error
 */
export default function EngineCore({
  status = 'idle',
  pulseRate = 1,
  activity = 0
}) {
  const mountRef = useRef(null);
  const statusRef = useRef(status);
  const pulseRef = useRef(pulseRate);
  const activityRef = useRef(activity);
  statusRef.current = status;
  pulseRef.current = pulseRate;
  activityRef.current = activity;

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    let disposed = false;
    let animationId = 0;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#021018');
    scene.fog = new THREE.FogExp2(0x021018, 0.04);

    const w = mount.clientWidth || 640;
    const h = mount.clientHeight || 420;
    const camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 100);
    camera.position.set(0, 0.35, 5.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 2.8;
    controls.maxDistance = 9;

    scene.add(new THREE.AmbientLight(0x0e7490, 0.35));
    const key = new THREE.PointLight(0x22d3ee, 2.8, 30);
    key.position.set(2.5, 2.5, 4);
    scene.add(key);
    const fill = new THREE.PointLight(0x67e8f9, 1.4, 20);
    fill.position.set(-3, 0, 2);
    scene.add(fill);

    // Soft glow sprite
    const spriteTex = (() => {
      const size = 128;
      const c = document.createElement('canvas');
      c.width = size;
      c.height = size;
      const ctx = c.getContext('2d');
      const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
      g.addColorStop(0, 'rgba(255,255,255,1)');
      g.addColorStop(0.25, 'rgba(103,232,249,0.7)');
      g.addColorStop(0.55, 'rgba(34,211,238,0.25)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, size, size);
      return new THREE.CanvasTexture(c);
    })();

    /** Fibonacci sphere → circular particle heart core */
    function spherePoints(count, radius) {
      const positions = new Float32Array(count * 3);
      const seeds = new Float32Array(count);
      const golden = Math.PI * (3 - Math.sqrt(5));
      for (let i = 0; i < count; i++) {
        const y = 1 - (i / (count - 1)) * 2;
        const r = Math.sqrt(Math.max(0, 1 - y * y));
        const theta = golden * i;
        positions[i * 3] = Math.cos(theta) * r * radius;
        positions[i * 3 + 1] = y * radius;
        positions[i * 3 + 2] = Math.sin(theta) * r * radius;
        seeds[i] = Math.random();
      }
      return { positions, seeds };
    }

    function makePoints(count, radius, color, size) {
      const { positions, seeds } = spherePoints(count, radius);
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geo.setAttribute('seed', new THREE.BufferAttribute(seeds, 1));
      // Keep base positions for pulse morph
      const base = positions.slice();
      const mat = new THREE.PointsMaterial({
        map: spriteTex,
        color,
        size,
        transparent: true,
        opacity: 0.95,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true
      });
      return { points: new THREE.Points(geo, mat), base, count, geo, mat };
    }

    // Multi-shell circular core (the “heart”)
    const coreDense = makePoints(900, 1.05, '#67e8f9', 0.08);
    const coreMid = makePoints(600, 1.35, '#22d3ee', 0.06);
    const coreOuter = makePoints(400, 1.7, '#a5f3fc', 0.05);
    const coreAccent = makePoints(220, 0.7, '#ffffff', 0.045);
    scene.add(coreDense.points, coreMid.points, coreOuter.points, coreAccent.points);

    // Orbital ring particles (flat circle belt)
    const ringCount = 280;
    const ringPos = new Float32Array(ringCount * 3);
    const ringBase = new Float32Array(ringCount * 3);
    for (let i = 0; i < ringCount; i++) {
      const a = (i / ringCount) * Math.PI * 2;
      const r = 2.15 + (Math.random() - 0.5) * 0.08;
      ringPos[i * 3] = Math.cos(a) * r;
      ringPos[i * 3 + 1] = (Math.random() - 0.5) * 0.08;
      ringPos[i * 3 + 2] = Math.sin(a) * r;
    }
    ringBase.set(ringPos);
    const ringGeo = new THREE.BufferGeometry();
    ringGeo.setAttribute('position', new THREE.BufferAttribute(ringPos, 3));
    const ringMat = new THREE.PointsMaterial({
      map: spriteTex,
      color: '#22d3ee',
      size: 0.055,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    const ringPts = new THREE.Points(ringGeo, ringMat);
    scene.add(ringPts);

    // Second tilted ring
    const ring2 = ringPts.clone();
    ring2.geometry = ringGeo.clone();
    ring2.material = ringMat.clone();
    ring2.material.color.set('#67e8f9');
    ring2.rotation.x = Math.PI / 3.2;
    scene.add(ring2);

    // Ambient field
    const fieldCount = 500;
    const fieldPos = new Float32Array(fieldCount * 3);
    for (let i = 0; i < fieldCount; i++) {
      fieldPos[i * 3] = (Math.random() - 0.5) * 10;
      fieldPos[i * 3 + 1] = (Math.random() - 0.5) * 6;
      fieldPos[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    const fieldGeo = new THREE.BufferGeometry();
    fieldGeo.setAttribute('position', new THREE.BufferAttribute(fieldPos, 3));
    const field = new THREE.Points(
      fieldGeo,
      new THREE.PointsMaterial({
        map: spriteTex,
        color: '#0e7490',
        size: 0.04,
        transparent: true,
        opacity: 0.5,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      })
    );
    scene.add(field);

    // Rising streams
    const streamN = 80;
    const streamPos = new Float32Array(streamN * 3);
    for (let i = 0; i < streamN; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 2.4 + Math.random() * 1.2;
      streamPos[i * 3] = Math.cos(a) * r;
      streamPos[i * 3 + 1] = (Math.random() - 0.5) * 3;
      streamPos[i * 3 + 2] = Math.sin(a) * r;
    }
    const streamGeo = new THREE.BufferGeometry();
    streamGeo.setAttribute('position', new THREE.BufferAttribute(streamPos, 3));
    const streams = new THREE.Points(
      streamGeo,
      new THREE.PointsMaterial({
        map: spriteTex,
        color: '#22d3ee',
        size: 0.07,
        transparent: true,
        opacity: 0.75,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      })
    );
    scene.add(streams);

    // Soft torus guides (thin hologram circles)
    const guideMat = new THREE.MeshBasicMaterial({
      color: '#22d3ee',
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const guide1 = new THREE.Mesh(new THREE.TorusGeometry(2.15, 0.008, 8, 100), guideMat);
    guide1.rotation.x = Math.PI / 2;
    const guide2 = new THREE.Mesh(new THREE.TorusGeometry(2.55, 0.006, 8, 100), guideMat.clone());
    guide2.rotation.x = Math.PI / 2.4;
    scene.add(guide1, guide2);

    const grid = new THREE.GridHelper(14, 28, 0x0e7490, 0x082f49);
    grid.position.y = -1.9;
    if (Array.isArray(grid.material)) {
      grid.material.forEach((m) => {
        m.transparent = true;
        m.opacity = 0.35;
      });
    } else {
      grid.material.transparent = true;
      grid.material.opacity = 0.35;
    }
    scene.add(grid);

    const clock = new THREE.Clock();
    const STATE = {
      idle: { core: '#67e8f9', mid: '#22d3ee', outer: '#a5f3fc' },
      processing: { core: '#a5f3fc', mid: '#22d3ee', outer: '#e0f2fe' },
      active: { core: '#ffffff', mid: '#67e8f9', outer: '#22d3ee' },
      warning: { core: '#fde68a', mid: '#fbbf24', outer: '#f59e0b' },
      error: { core: '#fca5a5', mid: '#f87171', outer: '#ef4444' }
    };

    function pulseShell(shell, t, rate, act, spin) {
      const pos = shell.geo.attributes.position.array;
      const base = shell.base;
      const beat =
        1 +
        Math.sin(t * Math.PI * 2 * rate) * (0.07 + act * 0.06) +
        Math.sin(t * Math.PI * 4 * rate) * 0.025;
      for (let i = 0; i < shell.count; i++) {
        const i3 = i * 3;
        pos[i3] = base[i3] * beat;
        pos[i3 + 1] = base[i3 + 1] * beat;
        pos[i3 + 2] = base[i3 + 2] * beat;
      }
      shell.geo.attributes.position.needsUpdate = true;
      shell.points.rotation.y = t * spin;
      shell.mat.size = shell.mat.userData.baseSize * (0.9 + act * 0.4 + (beat - 1) * 2);
    }

    coreDense.mat.userData.baseSize = 0.08;
    coreMid.mat.userData.baseSize = 0.06;
    coreOuter.mat.userData.baseSize = 0.05;
    coreAccent.mat.userData.baseSize = 0.045;

    const render = () => {
      if (disposed) return;
      const t = clock.getElapsedTime();
      const st = statusRef.current || 'idle';
      const rate = pulseRef.current || 1;
      const act = Math.min(1, Math.max(0, activityRef.current || 0));
      const colors = STATE[st] || STATE.idle;

      coreDense.mat.color.set(colors.core);
      coreMid.mat.color.set(colors.mid);
      coreOuter.mat.color.set(colors.outer);
      coreAccent.mat.opacity = 0.7 + act * 0.3;

      pulseShell(coreDense, t, rate, act, 0.15);
      pulseShell(coreMid, t, rate, act, -0.1);
      pulseShell(coreOuter, t, rate, act, 0.08);
      pulseShell(coreAccent, t, rate * 1.2, act, 0.25);

      ringPts.rotation.y = t * 0.35;
      ring2.rotation.z = t * 0.28;
      ringMat.opacity = 0.65 + act * 0.3;

      // Animate primary ring radius slightly with beat
      const beat = 1 + Math.sin(t * Math.PI * 2 * rate) * 0.04;
      const rp = ringGeo.attributes.position.array;
      for (let i = 0; i < ringCount; i++) {
        const i3 = i * 3;
        rp[i3] = ringBase[i3] * beat;
        rp[i3 + 1] = ringBase[i3 + 1];
        rp[i3 + 2] = ringBase[i3 + 2] * beat;
      }
      ringGeo.attributes.position.needsUpdate = true;

      const sp = streamGeo.attributes.position.array;
      for (let i = 0; i < streamN; i++) {
        sp[i * 3 + 1] += 0.014 + act * 0.02;
        if (sp[i * 3 + 1] > 2.4) sp[i * 3 + 1] = -2.4;
      }
      streamGeo.attributes.position.needsUpdate = true;

      field.rotation.y = t * 0.04;
      guide1.rotation.z = t * 0.2;
      guide2.rotation.z = -t * 0.15;
      guide1.scale.setScalar(beat);

      key.intensity = 2.2 + act * 1.5 + Math.sin(t * Math.PI * 2 * rate) * 0.4;

      controls.update();
      renderer.render(scene, camera);
      animationId = requestAnimationFrame(render);
    };

    const onResize = () => {
      if (!mount) return;
      const nw = mount.clientWidth || 640;
      const nh = mount.clientHeight || 420;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };

    window.addEventListener('resize', onResize);
    render();

    return () => {
      disposed = true;
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', onResize);
      controls.dispose();
      spriteTex.dispose();
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
          else obj.material.dispose?.();
        }
      });
      renderer.dispose();
      renderer.forceContextLoss?.();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div className="engine-core" ref={mountRef} aria-label="AI Cardinal particle core" />;
}
