import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/**
 * AI Cardinal — living 3D heart core (framework-owned renderer surface).
 * Visual states: idle | processing | active | warning | error
 * One WebGL context per mount; dispose fully on unmount.
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
    scene.background = new THREE.Color('#030712');
    scene.fog = new THREE.FogExp2(0x030712, 0.05);

    const w = mount.clientWidth || 640;
    const h = mount.clientHeight || 420;
    const camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 100);
    camera.position.set(0, 0.4, 4.6);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h);
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 2.4;
    controls.maxDistance = 9;
    controls.target.set(0, 0, 0);

    scene.add(new THREE.AmbientLight(0x64748b, 0.4));
    const key = new THREE.PointLight(0x22d3ee, 2.4, 24);
    key.position.set(2.8, 2.2, 3.2);
    scene.add(key);
    const fill = new THREE.PointLight(0xf43f5e, 1.8, 18);
    fill.position.set(-2.4, -0.8, 2);
    scene.add(fill);
    const back = new THREE.DirectionalLight(0xa78bfa, 0.5);
    back.position.set(0, 2, -4);
    scene.add(back);

    // Anatomical-inspired heart (extruded shape + vessels)
    const heartShape = new THREE.Shape();
    heartShape.moveTo(0, 0.4);
    heartShape.bezierCurveTo(0, 0.65, -0.4, 0.9, -0.85, 0.62);
    heartShape.bezierCurveTo(-1.35, 0.25, -1.2, -0.4, -0.45, -0.85);
    heartShape.bezierCurveTo(-0.15, -1.05, 0, -1.15, 0, -1.15);
    heartShape.bezierCurveTo(0, -1.15, 0.15, -1.05, 0.45, -0.85);
    heartShape.bezierCurveTo(1.2, -0.4, 1.35, 0.25, 0.85, 0.62);
    heartShape.bezierCurveTo(0.4, 0.9, 0, 0.65, 0, 0.4);

    const extrude = new THREE.ExtrudeGeometry(heartShape, {
      depth: 0.62,
      bevelEnabled: true,
      bevelThickness: 0.1,
      bevelSize: 0.07,
      bevelSegments: 4,
      curveSegments: 20
    });
    extrude.center();

    const heartMat = new THREE.MeshPhysicalMaterial({
      color: '#e11d48',
      emissive: '#9f1239',
      emissiveIntensity: 0.4,
      metalness: 0.2,
      roughness: 0.32,
      clearcoat: 0.7,
      clearcoatRoughness: 0.25
    });
    const heart = new THREE.Mesh(extrude, heartMat);
    scene.add(heart);

    // Glowing vessel lines
    const vesselMat = new THREE.MeshStandardMaterial({
      color: '#fb7185',
      emissive: '#e11d48',
      emissiveIntensity: 0.8,
      roughness: 0.4
    });
    const vessels = new THREE.Group();
    for (let i = 0; i < 6; i++) {
      const tube = new THREE.Mesh(
        new THREE.TubeGeometry(
          new THREE.CatmullRomCurve3([
            new THREE.Vector3(0, 0.2, 0.2),
            new THREE.Vector3(Math.sin(i) * 0.5, 0.6 + i * 0.05, 0.3),
            new THREE.Vector3(Math.sin(i + 1) * 0.35, 1.0, 0.1)
          ]),
          24,
          0.025,
          6,
          false
        ),
        vesselMat
      );
      vessels.add(tube);
    }
    heart.add(vessels);

    // Holographic rings
    const makeRing = (radius, color, emissive) => {
      const mesh = new THREE.Mesh(
        new THREE.TorusGeometry(radius, 0.018, 10, 96),
        new THREE.MeshStandardMaterial({
          color,
          emissive,
          emissiveIntensity: 0.55,
          metalness: 0.7,
          roughness: 0.25,
          transparent: true,
          opacity: 0.85
        })
      );
      return mesh;
    };
    const ringA = makeRing(1.65, '#22d3ee', '#0891b2');
    ringA.rotation.x = Math.PI / 2.3;
    const ringB = makeRing(1.95, '#a78bfa', '#6d28d9');
    ringB.rotation.x = Math.PI / 1.75;
    const ringC = makeRing(2.25, '#38bdf8', '#0284c7');
    ringC.rotation.x = Math.PI / 2.05;
    scene.add(ringA, ringB, ringC);

    // Energy particles
    const count = 180;
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const r = 1.2 + Math.random() * 2.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
      speeds[i] = 0.2 + Math.random() * 0.6;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const pMat = new THREE.PointsMaterial({
      color: '#67e8f9',
      size: 0.035,
      transparent: true,
      opacity: 0.75,
      depthWrite: false
    });
    const points = new THREE.Points(pGeo, pMat);
    scene.add(points);

    // Scan plane
    const scan = new THREE.Mesh(
      new THREE.PlaneGeometry(3.2, 3.2),
      new THREE.MeshBasicMaterial({
        color: '#22d3ee',
        transparent: true,
        opacity: 0.06,
        side: THREE.DoubleSide,
        depthWrite: false
      })
    );
    scene.add(scan);

    const clock = new THREE.Clock();
    const STATE_COLORS = {
      idle: { body: '#e11d48', emissive: '#9f1239', intensity: 0.35 },
      processing: { body: '#f43f5e', emissive: '#be123c', intensity: 0.7 },
      active: { body: '#fb7185', emissive: '#e11d48', intensity: 0.9 },
      warning: { body: '#f59e0b', emissive: '#b45309', intensity: 0.65 },
      error: { body: '#ef4444', emissive: '#7f1d1d', intensity: 0.5 }
    };

    const render = () => {
      if (disposed) return;
      const t = clock.getElapsedTime();
      const st = statusRef.current || 'idle';
      const rate = pulseRef.current || 1;
      const act = Math.min(1, Math.max(0, activityRef.current || 0));
      const palette = STATE_COLORS[st] || STATE_COLORS.idle;

      const beat =
        1 +
        Math.sin(t * Math.PI * 2 * rate) * (0.055 + act * 0.04) +
        Math.sin(t * Math.PI * 4 * rate) * 0.02;

      heart.scale.setScalar(beat);
      heart.rotation.y = t * 0.25;
      heart.rotation.x = Math.sin(t * 0.35) * 0.1;

      heartMat.color.set(palette.body);
      heartMat.emissive.set(palette.emissive);
      heartMat.emissiveIntensity = palette.intensity + (beat - 1) * 3 + act * 0.3;

      ringA.rotation.z = t * 0.55;
      ringB.rotation.z = -t * 0.4;
      ringC.rotation.z = t * 0.22;
      ringA.material.opacity = 0.5 + act * 0.4;

      scan.position.y = Math.sin(t * 1.2) * 1.1;
      scan.rotation.y = t * 0.3;

      const pos = pGeo.attributes.position.array;
      for (let i = 0; i < count; i++) {
        pos[i * 3 + 1] += Math.sin(t * speeds[i] + i) * 0.002;
      }
      pGeo.attributes.position.needsUpdate = true;
      points.rotation.y = t * 0.1;

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
