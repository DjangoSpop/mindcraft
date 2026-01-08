import { Entity } from './Entity';
import { Vector3 } from 'three';
import { World } from '../world/World';

export class Enemy extends Entity {
  private world: World;
  private targetPosition: Vector3;
  private moveSpeed: number = 2.0;
  private changeDirectionTimer: number = 0;
  private changeDirectionInterval: number = 2.0;
  private gravity: number = -20.0;
  private isOnGround: boolean = false;

  constructor(world: World, position: Vector3) {
    super('/assets/spider.png', 50);
    this.world = world;
    this.position.copy(position);
    this.targetPosition = position.clone();
    this.sprite.scale.set(1.2, 1, 1.2);
    this.chooseNewTarget();
  }

  update(deltaTime: number): void {
    if (!this.isAlive) return;

    this.changeDirectionTimer += deltaTime;
    if (this.changeDirectionTimer >= this.changeDirectionInterval) {
      this.chooseNewTarget();
      this.changeDirectionTimer = 0;
    }

    this.updateMovement(deltaTime);
    this.updatePhysics(deltaTime);
    this.updatePosition();
  }

  private chooseNewTarget(): void {
    const radius = 8;
    this.targetPosition = new Vector3(
      this.position.x + (Math.random() - 0.5) * radius,
      this.position.y,
      this.position.z + (Math.random() - 0.5) * radius
    );

    this.targetPosition.x = Math.max(1, Math.min(this.world.sizeX - 1, this.targetPosition.x));
    this.targetPosition.z = Math.max(1, Math.min(this.world.sizeZ - 1, this.targetPosition.z));
  }

  private updateMovement(_deltaTime: number): void {
    const direction = this.targetPosition.clone().sub(this.position);
    direction.y = 0;

    if (direction.length() > 0.5) {
      direction.normalize();
      this.velocity.x = direction.x * this.moveSpeed;
      this.velocity.z = direction.z * this.moveSpeed;
    } else {
      this.velocity.x = 0;
      this.velocity.z = 0;
    }

    if (Math.random() < 0.01 && this.isOnGround) {
      this.velocity.y = 6.0;
      this.isOnGround = false;
    }
  }

  private updatePhysics(deltaTime: number): void {
    this.velocity.y += this.gravity * deltaTime;

    const nextPos = this.position.clone().add(this.velocity.clone().multiplyScalar(deltaTime));

    const enemyAABB = {
      min: { x: nextPos.x - 0.5, y: nextPos.y - 0.5, z: nextPos.z - 0.5 },
      max: { x: nextPos.x + 0.5, y: nextPos.y + 0.5, z: nextPos.z + 0.5 }
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

            if (this.aabbIntersects(enemyAABB, blockAABB)) {
              if (this.velocity.y < 0 && this.position.y > y + 1) {
                nextPos.y = y + 1 + 0.5;
                this.velocity.y = 0;
                this.isOnGround = true;
                collided = true;
              } else if (this.velocity.y > 0 && this.position.y < y) {
                nextPos.y = y - 0.5;
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
      this.isAlive = false;
    }
  }

  private aabbIntersects(a: any, b: any): boolean {
    return a.min.x < b.max.x && a.max.x > b.min.x &&
           a.min.y < b.max.y && a.max.y > b.min.y &&
           a.min.z < b.max.z && a.max.z > b.min.z;
  }
}
