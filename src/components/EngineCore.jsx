import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/**
 * AI Cardinal — futuristic 3D heart core with multi-layer particles.
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
    scene.background = new THREE.Color('#01040d');
    scene.fog = new THREE.FogExp2(0x01040d, 0.038);

    const w = mount.clientWidth || 640;
    const h = mount.clientHeight || 420;
    const camera = new THREE.PerspectiveCamera(38, w / h, 0.1, 120);
    camera.position.set(0.15, 0.55, 5.1);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.055;
    controls.minDistance = 2.6;
    controls.maxDistance = 10;
    controls.target.set(0, 0, 0);

    // Lighting — neon command centre
    scene.add(new THREE.AmbientLight(0x1e293b, 0.55));
    const key = new THREE.PointLight(0x22d3ee, 3.2, 28);
    key.position.set(3.2, 2.6, 3.4);
    scene.add(key);
    const fill = new THREE.PointLight(0xf43f5e, 2.4, 22);
    fill.position.set(-2.8, -0.6, 2.2);
    scene.add(fill);
    const rim = new THREE.PointLight(0xa78bfa, 1.8, 20);
    rim.position.set(0.5, 3.2, -2.5);
    scene.add(rim);
    const coreGlow = new THREE.PointLight(0xfb7185, 1.2, 6);
    scene.add(coreGlow);

    // —— Heart mesh ——
    const heartShape = new THREE.Shape();
    heartShape.moveTo(0, 0.42);
    heartShape.bezierCurveTo(0, 0.68, -0.42, 0.95, -0.9, 0.64);
    heartShape.bezierCurveTo(-1.4, 0.22, -1.25, -0.42, -0.48, -0.9);
    heartShape.bezierCurveTo(-0.16, -1.1, 0, -1.2, 0, -1.2);
    heartShape.bezierCurveTo(0, -1.2, 0.16, -1.1, 0.48, -0.9);
    heartShape.bezierCurveTo(1.25, -0.42, 1.4, 0.22, 0.9, 0.64);
    heartShape.bezierCurveTo(0.42, 0.95, 0, 0.68, 0, 0.42);

    const extrude = new THREE.ExtrudeGeometry(heartShape, {
      depth: 0.7,
      bevelEnabled: true,
      bevelThickness: 0.12,
      bevelSize: 0.08,
      bevelSegments: 5,
      curveSegments: 28
    });
    extrude.center();

    const heartMat = new THREE.MeshPhysicalMaterial({
      color: '#e11d48',
      emissive: '#9f1239',
      emissiveIntensity: 0.55,
      metalness: 0.35,
      roughness: 0.22,
      clearcoat: 1,
      clearcoatRoughness: 0.15,
      sheen: 0.5,
      sheenColor: new THREE.Color('#fb7185')
    });
    const heart = new THREE.Mesh(extrude, heartMat);
    scene.add(heart);

    // Wireframe shell (futuristic cage)
    const wire = new THREE.Mesh(
      extrude.clone(),
      new THREE.MeshBasicMaterial({
        color: '#67e8f9',
        wireframe: true,
        transparent: true,
        opacity: 0.12
      })
    );
    wire.scale.setScalar(1.08);
    heart.add(wire);

    // Energy vessels
    const vesselMat = new THREE.MeshStandardMaterial({
      color: '#fda4af',
      emissive: '#e11d48',
      emissiveIntensity: 1.1,
      roughness: 0.25,
      metalness: 0.4
    });
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      const tube = new THREE.Mesh(
        new THREE.TubeGeometry(
          new THREE.CatmullRomCurve3([
            new THREE.Vector3(0, 0.15, 0.15),
            new THREE.Vector3(Math.cos(a) * 0.45, 0.45 + (i % 3) * 0.08, Math.sin(a) * 0.35),
            new THREE.Vector3(Math.cos(a) * 0.3, 0.95, Math.sin(a) * 0.2)
          ]),
          32,
          0.02,
          6,
          false
        ),
        vesselMat
      );
      heart.add(tube);
    }

    // Holo rings + dashed data rings
    const makeRing = (radius, color, emissive, tube = 0.016) =>
      new THREE.Mesh(
        new THREE.TorusGeometry(radius, tube, 12, 128),
        new THREE.MeshStandardMaterial({
          color,
          emissive,
          emissiveIntensity: 0.7,
          metalness: 0.85,
          roughness: 0.2,
          transparent: true,
          opacity: 0.9
        })
      );

    const ringA = makeRing(1.7, '#22d3ee', '#0891b2');
    ringA.rotation.x = Math.PI / 2.25;
    const ringB = makeRing(2.05, '#a78bfa', '#6d28d9', 0.012);
    ringB.rotation.x = Math.PI / 1.7;
    const ringC = makeRing(2.4, '#38bdf8', '#0284c7', 0.01);
    ringC.rotation.x = Math.PI / 2.05;
    const ringD = makeRing(2.75, '#f472b6', '#be185d', 0.008);
    ringD.rotation.x = Math.PI / 2.5;
    scene.add(ringA, ringB, ringC, ringD);

    // Vertical holo pillars
    const pillarGeo = new THREE.CylinderGeometry(0.015, 0.015, 3.6, 6);
    const pillarMat = new THREE.MeshBasicMaterial({
      color: '#22d3ee',
      transparent: true,
      opacity: 0.25
    });
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const p = new THREE.Mesh(pillarGeo, pillarMat);
      p.position.set(Math.cos(a) * 2.9, 0, Math.sin(a) * 2.9);
      scene.add(p);
    }

    // —— Particle systems ——
    const sprite = (() => {
      const size = 64;
      const c = document.createElement('canvas');
      c.width = size;
      c.height = size;
      const ctx = c.getContext('2d');
      const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      g.addColorStop(0, 'rgba(255,255,255,1)');
      g.addColorStop(0.35, 'rgba(180,240,255,0.55)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, size, size);
      const tex = new THREE.CanvasTexture(c);
      return tex;
    })();

    function makeField(count, radiusMin, radiusMax, color, size) {
      const positions = new Float32Array(count * 3);
      const phases = new Float32Array(count);
      const radii = new Float32Array(count);
      for (let i = 0; i < count; i++) {
        const r = radiusMin + Math.random() * (radiusMax - radiusMin);
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = r * Math.cos(phi);
        phases[i] = Math.random() * Math.PI * 2;
        radii[i] = r;
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const mat = new THREE.PointsMaterial({
        map: sprite,
        color,
        size,
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true
      });
      return { points: new THREE.Points(geo, mat), phases, radii, count, geo };
    }

    const fieldOrbit = makeField(520, 1.4, 3.4, '#67e8f9', 0.07);
    const fieldInner = makeField(280, 0.6, 1.5, '#fb7185', 0.05);
    const fieldOuter = makeField(360, 3.2, 5.2, '#c4b5fd', 0.06);
    const fieldSparks = makeField(160, 0.9, 2.2, '#ffffff', 0.04);
    scene.add(fieldOrbit.points, fieldInner.points, fieldOuter.points, fieldSparks.points);

    // Rising data-stream columns (particle beams)
    const streamCount = 90;
    const streamPos = new Float32Array(streamCount * 3);
    const streamPhase = new Float32Array(streamCount);
    for (let i = 0; i < streamCount; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 1.8 + Math.random() * 1.4;
      streamPos[i * 3] = Math.cos(a) * r;
      streamPos[i * 3 + 1] = (Math.random() - 0.5) * 3;
      streamPos[i * 3 + 2] = Math.sin(a) * r;
      streamPhase[i] = Math.random() * Math.PI * 2;
    }
    const streamGeo = new THREE.BufferGeometry();
    streamGeo.setAttribute('position', new THREE.BufferAttribute(streamPos, 3));
    const streamMat = new THREE.PointsMaterial({
      map: sprite,
      color: '#22d3ee',
      size: 0.08,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    const streams = new THREE.Points(streamGeo, streamMat);
    scene.add(streams);

    // Shockwave disc (pulses with heartbeat)
    const shock = new THREE.Mesh(
      new THREE.RingGeometry(0.3, 0.55, 64),
      new THREE.MeshBasicMaterial({
        color: '#22d3ee',
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      })
    );
    shock.rotation.x = -Math.PI / 2;
    scene.add(shock);

    // Scan plane
    const scan = new THREE.Mesh(
      new THREE.PlaneGeometry(4.2, 4.2),
      new THREE.MeshBasicMaterial({
        color: '#22d3ee',
        transparent: true,
        opacity: 0.05,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      })
    );
    scene.add(scan);

    // Floor grid (tech)
    const grid = new THREE.GridHelper(12, 24, 0x164e63, 0x0f172a);
    grid.position.y = -1.8;
    grid.material.transparent = true;
    grid.material.opacity = 0.45;
    scene.add(grid);

    const clock = new THREE.Clock();
    const STATE_COLORS = {
      idle: { body: '#e11d48', emissive: '#9f1239', intensity: 0.45, spark: '#67e8f9' },
      processing: { body: '#f43f5e', emissive: '#be123c', intensity: 0.85, spark: '#a5f3fc' },
      active: { body: '#fb7185', emissive: '#e11d48', intensity: 1.05, spark: '#ffffff' },
      warning: { body: '#f59e0b', emissive: '#b45309', intensity: 0.75, spark: '#fde68a' },
      error: { body: '#ef4444', emissive: '#7f1d1d', intensity: 0.55, spark: '#fca5a5' }
    };

    function orbitField(field, t, speed, act) {
      const pos = field.geo.attributes.position.array;
      for (let i = 0; i < field.count; i++) {
        const phase = field.phases[i] + t * speed;
        const r = field.radii[i] * (1 + Math.sin(phase * 0.7) * 0.03 * (1 + act));
        const y = pos[i * 3 + 1] + Math.sin(phase + i) * 0.0015;
        // soft rebuild from spherical-ish drift
        const x0 = pos[i * 3];
        const z0 = pos[i * 3 + 2];
        const ang = Math.atan2(z0, x0) + speed * 0.01 * (1 + act * 0.5);
        const xz = Math.sqrt(x0 * x0 + z0 * z0) || r;
        pos[i * 3] = Math.cos(ang) * xz;
        pos[i * 3 + 1] = y;
        pos[i * 3 + 2] = Math.sin(ang) * xz;
      }
      field.geo.attributes.position.needsUpdate = true;
      field.points.rotation.y = t * speed * 0.15;
    }

    const render = () => {
      if (disposed) return;
      const t = clock.getElapsedTime();
      const st = statusRef.current || 'idle';
      const rate = pulseRef.current || 1;
      const act = Math.min(1, Math.max(0, activityRef.current || 0));
      const palette = STATE_COLORS[st] || STATE_COLORS.idle;

      const beat =
        1 +
        Math.sin(t * Math.PI * 2 * rate) * (0.06 + act * 0.05) +
        Math.sin(t * Math.PI * 4 * rate) * 0.022;

      heart.scale.setScalar(beat);
      heart.rotation.y = t * 0.22;
      heart.rotation.x = Math.sin(t * 0.32) * 0.1;
      wire.material.opacity = 0.08 + act * 0.18 + (beat - 1) * 1.5;

      heartMat.color.set(palette.body);
      heartMat.emissive.set(palette.emissive);
      heartMat.emissiveIntensity = palette.intensity + (beat - 1) * 4 + act * 0.4;
      coreGlow.intensity = 0.8 + act * 1.5 + (beat - 1) * 8;
      coreGlow.color.set(palette.emissive);

      ringA.rotation.z = t * 0.6;
      ringB.rotation.z = -t * 0.42;
      ringC.rotation.z = t * 0.25;
      ringD.rotation.z = -t * 0.18;
      ringA.material.emissiveIntensity = 0.5 + act * 0.8;
      ringB.material.opacity = 0.55 + act * 0.35;

      // Shockwave on each beat peak
      const beatWave = Math.max(0, Math.sin(t * Math.PI * 2 * rate));
      shock.scale.setScalar(1 + beatWave * (1.8 + act));
      shock.material.opacity = beatWave * (0.35 + act * 0.35);
      shock.material.color.set(palette.spark);

      scan.position.y = Math.sin(t * 1.15) * 1.35;
      scan.rotation.y = t * 0.35;
      scan.material.opacity = 0.04 + act * 0.06;

      orbitField(fieldOrbit, t, 0.8 + act, act);
      orbitField(fieldInner, t, -1.2 - act, act);
      orbitField(fieldOuter, t, 0.35, act);
      orbitField(fieldSparks, t, 1.6 + act * 2, act);
      fieldSparks.points.material.color.set(palette.spark);
      fieldInner.points.material.opacity = 0.55 + act * 0.4;
      fieldOrbit.points.material.size = 0.06 + act * 0.04;

      // Rising streams
      const sp = streamGeo.attributes.position.array;
      for (let i = 0; i < streamCount; i++) {
        sp[i * 3 + 1] += 0.012 + act * 0.02;
        if (sp[i * 3 + 1] > 2.2) sp[i * 3 + 1] = -2.2;
      }
      streamGeo.attributes.position.needsUpdate = true;
      streamMat.opacity = 0.45 + act * 0.5;

      grid.rotation.y = t * 0.02;

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
      sprite.dispose();
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

  return (
    <div className="engine-core" ref={mountRef} aria-label="AI Cardinal 3D heart core" />
  );
}
