import * as THREE from 'three';

/**
 * Deterministic height + mesh generator per chunk.
 * Framework demo terrain — swap heightAt / createChunkMesh for your own world data.
 */
function hash2(x, z) {
  const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453;
  return s - Math.floor(s);
}

function smoothNoise(x, z) {
  const x0 = Math.floor(x);
  const z0 = Math.floor(z);
  const fx = x - x0;
  const fz = z - z0;
  const v00 = hash2(x0, z0);
  const v10 = hash2(x0 + 1, z0);
  const v01 = hash2(x0, z0 + 1);
  const v11 = hash2(x0 + 1, z0 + 1);
  const ix0 = v00 * (1 - fx) + v10 * fx;
  const ix1 = v01 * (1 - fx) + v11 * fx;
  return ix0 * (1 - fz) + ix1 * fz;
}

function fbm(x, z) {
  let value = 0;
  let amp = 1;
  let freq = 1;
  let norm = 0;
  for (let i = 0; i < 4; i++) {
    value += smoothNoise(x * freq, z * freq) * amp;
    norm += amp;
    amp *= 0.5;
    freq *= 2;
  }
  return value / norm;
}

/**
 * World-space ground height. PlayerController and mesh generation MUST use the same function.
 * Mild amplitude so the demo surface stays walkable as a framework sample.
 */
export function heightAt(worldX, worldZ) {
  const n = fbm(worldX * 0.02, worldZ * 0.02);
  return (n - 0.5) * 4;
}

/**
 * PlaneGeometry is centered on its local origin.
 * Mesh is placed at chunk center, so world = center + local.
 */
export function chunkCenter(cx, cz, chunkSize = 64) {
  return {
    x: cx * chunkSize + chunkSize / 2,
    z: cz * chunkSize + chunkSize / 2
  };
}

export function createChunkMesh(cx, cz, chunkSize = 64, resolution = 24) {
  const geometry = new THREE.PlaneGeometry(chunkSize, chunkSize, resolution, resolution);
  geometry.rotateX(-Math.PI / 2);

  const positions = geometry.attributes.position;
  const colors = [];
  const color = new THREE.Color();
  const center = chunkCenter(cx, cz, chunkSize);

  for (let i = 0; i < positions.count; i++) {
    const lx = positions.getX(i);
    const lz = positions.getZ(i);
    // CRITICAL: match mesh.position + local vertex = world sample used by PlayerController
    const wx = center.x + lx;
    const wz = center.z + lz;
    const h = heightAt(wx, wz);
    positions.setY(i, h);

    if (h < -1) color.set('#1e3a5f');
    else if (h < 0.4) color.set('#2f6b3a');
    else if (h < 1.8) color.set('#4a7c3f');
    else color.set('#8a8a7a');

    colors.push(color.r, color.g, color.b);
  }

  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.computeVertexNormals();
  positions.needsUpdate = true;

  const material = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.92,
    metalness: 0.05
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(center.x, 0, center.z);
  mesh.receiveShadow = true;
  mesh.userData = { type: 'chunk', cx, cz };

  return mesh;
}

export function createWorldProps(cx, cz, chunkSize = 64, count = 5) {
  const group = new THREE.Group();
  const seed = hash2(cx * 12.3, cz * 45.7);
  const center = chunkCenter(cx, cz, chunkSize);

  for (let i = 0; i < count; i++) {
    const ox = (hash2(cx + i, cz + i * 2) - 0.5) * chunkSize * 0.75;
    const oz = (hash2(cz + i * 3, cx + i) - 0.5) * chunkSize * 0.75;
    const wx = center.x + ox;
    const wz = center.z + oz;
    const h = heightAt(wx, wz);
    if (h < -0.8) continue;

    const kind = hash2(i + seed, cx + cz);
    let mesh;

    if (kind < 0.55) {
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.3, 2.2, 6),
        new THREE.MeshStandardMaterial({ color: '#5c3a21', roughness: 1 })
      );
      trunk.position.y = 1.1;
      const leaves = new THREE.Mesh(
        new THREE.ConeGeometry(1.2, 2.4, 7),
        new THREE.MeshStandardMaterial({ color: '#1f6b3a', roughness: 0.9 })
      );
      leaves.position.y = 2.8;
      mesh = new THREE.Group();
      mesh.add(trunk, leaves);
    } else if (kind < 0.8) {
      mesh = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.45 + kind * 0.35, 0),
        new THREE.MeshStandardMaterial({ color: '#6b7280', roughness: 1, flatShading: true })
      );
      mesh.position.y = 0.3;
    } else {
      mesh = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.4, 0),
        new THREE.MeshStandardMaterial({
          color: '#22d3ee',
          emissive: '#0891b2',
          emissiveIntensity: 0.35,
          roughness: 0.3
        })
      );
      mesh.position.y = 0.5;
      mesh.userData.collectible = true;
    }

    mesh.position.x = ox;
    mesh.position.z = oz;
    mesh.position.y += h;
    group.add(mesh);
  }

  group.position.set(center.x, 0, center.z);
  return group;
}
