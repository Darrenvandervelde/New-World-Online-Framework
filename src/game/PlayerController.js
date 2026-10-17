import * as THREE from 'three';
import { heightAt } from '../world/TerrainGenerator';

/**
 * Framework player movement bound to a camera + PointerLockControls.
 * Inject a custom `getGroundHeight(x, z)` when you replace demo terrain.
 */
export function createPlayerController({
  camera,
  controls,
  walkSpeed = 6,
  sprintSpeed = 11,
  jumpForce = 8,
  gravity = 22,
  eyeHeight = 1.7,
  getGroundHeight = heightAt
} = {}) {
  const velocity = new THREE.Vector3();
  const direction = new THREE.Vector3();
  const keyState = {};
  let grounded = true;
  let stamina = 110;
  const maxStamina = 110;

  return {
    onKeyDown(code) {
      keyState[code] = true;
      if (code === 'Space' && grounded) {
        velocity.y = jumpForce;
        grounded = false;
      }
    },

    onKeyUp(code) {
      keyState[code] = false;
    },

    update(delta) {
      const sprinting =
        (keyState.ShiftLeft || keyState.ShiftRight) &&
        stamina > 0 &&
        (keyState.KeyW || keyState.ArrowUp);

      const speed = sprinting ? sprintSpeed : walkSpeed;

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

      if (sprinting && direction.lengthSq() > 0) {
        stamina = Math.max(0, stamina - 18 * delta);
      } else {
        stamina = Math.min(maxStamina, stamina + 12 * delta);
      }

      velocity.y -= gravity * delta;
      camera.position.y += velocity.y * delta;

      // Camera sits at eye height above the same height function the mesh uses
      const groundY = getGroundHeight(camera.position.x, camera.position.z) + eyeHeight;
      if (camera.position.y <= groundY) {
        camera.position.y = groundY;
        velocity.y = 0;
        grounded = true;
      } else {
        grounded = false;
      }

      return {
        position: {
          x: camera.position.x,
          y: camera.position.y,
          z: camera.position.z
        },
        stamina: Math.round(stamina),
        maxStamina,
        isSprinting: sprinting,
        isGrounded: grounded
      };
    },

    getStamina() {
      return { stamina, maxStamina };
    },

    resetKeys() {
      Object.keys(keyState).forEach((k) => {
        keyState[k] = false;
      });
    }
  };
}
