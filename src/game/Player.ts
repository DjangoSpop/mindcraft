import { PerspectiveCamera, Vector3 } from 'three';
import { GameState } from './GameState';
import { InputManager } from '../engine/InputManager';

export class Player {
  camera: PerspectiveCamera;
  private velocity: Vector3 = new Vector3();
  private gameState: GameState;
  private inputManager: InputManager;

  private moveSpeed: number = 5.0;
  private jumpForce: number = 8.0;
  private gravity: number = -20.0;
  private isOnGround: boolean = false;

  private yaw: number = 0;
  private pitch: number = 0;
  private mouseSensitivity: number = 0.002;

  constructor(gameState: GameState, inputManager: InputManager) {
    this.gameState = gameState;
    this.inputManager = inputManager;

    this.camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(16, 10, 16);

    window.addEventListener('resize', () => this.onResize());
    document.addEventListener('mousemove', (e) => this.onMouseMove(e));
  }

  private onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }

  private onMouseMove(event: MouseEvent) {
    if (document.pointerLockElement !== document.body) return;

    this.yaw -= event.movementX * this.mouseSensitivity;
    this.pitch -= event.movementY * this.mouseSensitivity;
    this.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitch));
  }

  update(deltaTime: number) {
    this.updateRotation();
    this.updateMovement(deltaTime);
    this.updatePhysics(deltaTime);
    this.inputManager.update();
  }

  private updateRotation() {
    this.camera.rotation.set(this.pitch, this.yaw, 0, 'YXZ');
  }

  private updateMovement(deltaTime: number) {
    const forward = new Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
    forward.y = 0;
    forward.normalize();

    const right = new Vector3(1, 0, 0).applyQuaternion(this.camera.quaternion);
    right.normalize();

    const moveDir = new Vector3();

    if (this.inputManager.isKeyPressed('KeyW')) moveDir.add(forward);
    if (this.inputManager.isKeyPressed('KeyS')) moveDir.sub(forward);
    if (this.inputManager.isKeyPressed('KeyD')) moveDir.add(right);
    if (this.inputManager.isKeyPressed('KeyA')) moveDir.sub(right);

    if (moveDir.length() > 0) {
      moveDir.normalize();
      this.velocity.x = moveDir.x * this.moveSpeed;
      this.velocity.z = moveDir.z * this.moveSpeed;
    } else {
      this.velocity.x = 0;
      this.velocity.z = 0;
    }

    if (this.inputManager.isKeyPressed('Space') && this.isOnGround) {
      this.velocity.y = this.jumpForce;
      this.isOnGround = false;
    }
  }

  private updatePhysics(deltaTime: number) {
    this.velocity.y += this.gravity * deltaTime;

    const nextPos = this.camera.position.clone().add(this.velocity.clone().multiplyScalar(deltaTime));

    const playerAABB = {
      min: { x: nextPos.x - 0.3, y: nextPos.y - 1.5, z: nextPos.z - 0.3 },
      max: { x: nextPos.x + 0.3, y: nextPos.y + 0.3, z: nextPos.z + 0.3 }
    };

    let collided = false;
    const checkRadius = 2;
    const px = Math.floor(nextPos.x);
    const py = Math.floor(nextPos.y);
    const pz = Math.floor(nextPos.z);

    for (let x = px - checkRadius; x <= px + checkRadius; x++) {
      for (let y = py - checkRadius; y <= py + checkRadius; y++) {
        for (let z = pz - checkRadius; z <= pz + checkRadius; z++) {
          if (this.gameState.world.getBlock(x, y, z) !== 0) {
            const blockAABB = {
              min: { x: x, y: y, z: z },
              max: { x: x + 1, y: y + 1, z: z + 1 }
            };

            if (this.aabbIntersects(playerAABB, blockAABB)) {
              if (this.velocity.y < 0 && this.camera.position.y > y + 1) {
                nextPos.y = y + 1 + 1.5;
                this.velocity.y = 0;
                this.isOnGround = true;
                collided = true;
              }
            }
          }
        }
      }
    }

    if (!collided && this.velocity.y < 0) {
      this.isOnGround = false;
    }

    this.camera.position.copy(nextPos);

    if (this.camera.position.y < -10) {
      this.camera.position.set(16, 10, 16);
      this.velocity.set(0, 0, 0);
    }
  }

  private aabbIntersects(a: any, b: any): boolean {
    return a.min.x < b.max.x && a.max.x > b.min.x &&
           a.min.y < b.max.y && a.max.y > b.min.y &&
           a.min.z < b.max.z && a.max.z > b.min.z;
  }
}
