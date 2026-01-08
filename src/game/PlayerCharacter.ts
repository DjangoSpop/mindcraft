import { Entity } from './Entity';
import { InputManager } from '../engine/InputManager';
import { World } from '../world/World';
import { Vector3 } from 'three';

export class PlayerCharacter extends Entity {
  private inputManager: InputManager;
  private world: World;
  private moveSpeed: number = 5.0;
  private jumpForce: number = 8.0;
  private gravity: number = -20.0;
  private isOnGround: boolean = false;
  private yaw: number = 0;

  constructor(inputManager: InputManager, world: World) {
    super('/assets/player.png', 100);
    this.inputManager = inputManager;
    this.world = world;
    this.position.set(16, 5, 16);
    this.sprite.scale.set(1.5, 2, 1);

    document.addEventListener('mousemove', (e) => this.onMouseMove(e));
  }

  private onMouseMove(event: MouseEvent): void {
    if (document.pointerLockElement !== document.body) return;
    this.yaw -= event.movementX * 0.002;
  }

  getYaw(): number {
    return this.yaw;
  }

  update(deltaTime: number): void {
    this.updateMovement(deltaTime);
    this.updatePhysics(deltaTime);
    this.updatePosition();

    // Always face camera (billboard effect handled by Sprite)
    this.sprite.rotation.y = this.yaw;
  }

  private updateMovement(_deltaTime: number): void {
    const forward = new Vector3(
      Math.sin(this.yaw),
      0,
      Math.cos(this.yaw)
    );
    const right = new Vector3(
      Math.cos(this.yaw),
      0,
      -Math.sin(this.yaw)
    );

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

  private updatePhysics(deltaTime: number): void {
    this.velocity.y += this.gravity * deltaTime;

    const nextPos = this.position.clone().add(this.velocity.clone().multiplyScalar(deltaTime));

    const playerAABB = {
      min: { x: nextPos.x - 0.4, y: nextPos.y - 1, z: nextPos.z - 0.4 },
      max: { x: nextPos.x + 0.4, y: nextPos.y + 1, z: nextPos.z + 0.4 }
    };

    let collided = false;
    const checkRadius = 2;
    const px = Math.floor(nextPos.x);
    const py = Math.floor(nextPos.y);
    const pz = Math.floor(nextPos.z);

    for (let x = px - checkRadius; x <= px + checkRadius; x++) {
      for (let y = py - checkRadius; y <= py + checkRadius; y++) {
        for (let z = pz - checkRadius; z <= pz + checkRadius; z++) {
          if (this.world.getBlock(x, y, z) !== 0) {
            const blockAABB = {
              min: { x: x, y: y, z: z },
              max: { x: x + 1, y: y + 1, z: z + 1 }
            };

            if (this.aabbIntersects(playerAABB, blockAABB)) {
              if (this.velocity.y < 0 && this.position.y > y + 1) {
                nextPos.y = y + 1 + 1;
                this.velocity.y = 0;
                this.isOnGround = true;
                collided = true;
              } else if (this.velocity.y > 0 && this.position.y < y) {
                nextPos.y = y - 1;
                this.velocity.y = 0;
              }
            }
          }
        }
      }
    }

    if (!collided && this.velocity.y < 0) {
      this.isOnGround = false;
    }

    this.position.copy(nextPos);

    if (this.position.y < -10) {
      this.position.set(16, 10, 16);
      this.velocity.set(0, 0, 0);
      this.health = this.maxHealth;
    }
  }

  private aabbIntersects(a: any, b: any): boolean {
    return a.min.x < b.max.x && a.max.x > b.min.x &&
           a.min.y < b.max.y && a.max.y > b.min.y &&
           a.min.z < b.max.z && a.max.z > b.min.z;
  }

  getShootDirection(): Vector3 {
    return new Vector3(
      Math.sin(this.yaw),
      0,
      Math.cos(this.yaw)
    );
  }
}
