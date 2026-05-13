import * as THREE from 'three';

export function createCamera(width, height) {
  const camera = new THREE.PerspectiveCamera(70, width / height, 0.1, 1000);
  camera.position.set(0, 0.5, 3);
  return camera;
}

export function resizeCamera(camera, width, height) {
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}
