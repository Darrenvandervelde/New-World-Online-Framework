import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Visual core of the AI Cardinal / NWO framework.
 * One WebGL context for the component lifetime — a living 3D heart.
 */
export default function EngineCore({ status = 'online', pulseRate = 1 }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    let disposed = false;
    let animationId = 0;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#050814');
    scene.fog = new THREE.FogExp2(0x050814, 0.045);

    const camera = new THREE.PerspectiveCamera(
      42,
      (mount.clientWidth || 1) / (mount.clientHeight || 1),
      0.1,
      100
    );
    camera.position.set(0, 0.35, 4.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(mount.clientWidth || 640, mount.clientHeight || 400);
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0x94a3b8, 0.45));
    const key = new THREE.PointLight(0x38bdf8, 2.2, 20);
    key.position.set(2.5, 2, 3);
    scene.add(key);
    const rim = new THREE.PointLight(0xf43f5e, 1.6, 16);
    rim.position.set(-2, -1, 2);
    scene.add(rim);

    // Heart shape (extruded) — framework “core”
    const heartShape = new THREE.Shape();
    heartShape.moveTo(0, 0.35);
    heartShape.bezierCurveTo(0, 0.55, -0.35, 0.75, -0.7, 0.55);
    heartShape.bezierCurveTo(-1.15, 0.25, -1.05, -0.35, -0.4, -0.75);
    heartShape.bezierCurveTo(-0.15, -0.95, 0, -1.05, 0, -1.05);
    heartShape.bezierCurveTo(0, -1.05, 0.15, -0.95, 0.4, -0.75);
    heartShape.bezierCurveTo(1.05, -0.35, 1.15, 0.25, 0.7, 0.55);
    heartShape.bezierCurveTo(0.35, 0.75, 0, 0.55, 0, 0.35);

    const extrude = new THREE.ExtrudeGeometry(heartShape, {
      depth: 0.55,
      bevelEnabled: true,
      bevelThickness: 0.08,
      bevelSize: 0.06,
      bevelSegments: 3
    });
    extrude.center();

    const heartMat = new THREE.MeshPhysicalMaterial({
      color: '#e11d48',
      emissive: '#9f1239',
      emissiveIntensity: 0.35,
      metalness: 0.25,
      roughness: 0.35,
      clearcoat: 0.6,
      clearcoatRoughness: 0.3
    });
    const heart = new THREE.Mesh(extrude, heartMat);
    heart.scale.setScalar(0.95);
    scene.add(heart);

    // Orbital ring — “engine bus”
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.55, 0.025, 12, 80),
      new THREE.MeshStandardMaterial({
        color: '#38bdf8',
        emissive: '#0ea5e9',
        emissiveIntensity: 0.5,
        metalness: 0.6,
        roughness: 0.3
      })
    );
    ring.rotation.x = Math.PI / 2.4;
    scene.add(ring);

    const ring2 = ring.clone();
    ring2.scale.setScalar(1.18);
    ring2.rotation.x = Math.PI / 1.7;
    ring2.material = ring.material.clone();
    ring2.material.color.set('#a78bfa');
    ring2.material.emissive.set('#7c3aed');
    scene.add(ring2);

    // Soft particle field
    const count = 120;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 6;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 4;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const points = new THREE.Points(
      pGeo,
      new THREE.PointsMaterial({ color: '#67e8f9', size: 0.03, transparent: true, opacity: 0.7 })
    );
    scene.add(points);

    const clock = new THREE.Clock();

    const render = () => {
      if (disposed) return;
      const t = clock.getElapsedTime();
      const beat = 1 + Math.sin(t * Math.PI * 2 * pulseRate) * 0.06
        + Math.sin(t * Math.PI * 4 * pulseRate) * 0.025;

      heart.scale.setScalar(0.95 * beat);
      heart.rotation.y = t * 0.35;
      heart.rotation.x = Math.sin(t * 0.4) * 0.12;

      const online = status === 'online';
      heartMat.emissiveIntensity = online ? 0.35 + (beat - 1) * 2 : 0.08;
      heartMat.color.set(online ? '#e11d48' : '#64748b');

      ring.rotation.z = t * 0.5;
      ring2.rotation.z = -t * 0.35;
      points.rotation.y = t * 0.08;

      renderer.render(scene, camera);
      animationId = requestAnimationFrame(render);
    };

    const onResize = () => {
      if (!mount) return;
      const w = mount.clientWidth || 640;
      const h = mount.clientHeight || 400;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', onResize);
    render();

    return () => {
      disposed = true;
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', onResize);
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
  }, [pulseRate, status]);

  return <div className="engine-core" ref={mountRef} aria-label="Engine core — 3D heart" />;
}
