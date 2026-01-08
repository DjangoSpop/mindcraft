import { Mesh, CylinderGeometry, MeshBasicMaterial, Vector3, Box3 } from 'three';
import { World } from '../world/World';

export class Projectile {
  mesh: Mesh;
  position: Vector3;
  velocity: Vector3;
  isActive: boolean;
  damage: number;
  lifetime: number;
  maxLifetime: number;

  constructor(startPosition: Vector3, direction: Vector3, speed: number = 20) {
    const geometry = new CylinderGeometry(0.1, 0.1, 0.5, 8);
    const material = new MeshBasicMaterial({ color: 0x00ff00 });
    this.mesh = new Mesh(geometry, material);

    this.position = startPosition.clone();
    this.velocity = direction.clone().normalize().multiplyScalar(speed);
    this.isActive = true;
    this.damage = 25;
    this.lifetime = 0;
    this.maxLifetime = 3.0;

    this.mesh.rotation.z = Math.PI / 2;
    const angle = Math.atan2(direction.x, direction.z);
    this.mesh.rotation.y = angle;
  }

  update(deltaTime: number, world: World): void {
    if (!this.isActive) return;

    this.lifetime += deltaTime;
    if (this.lifetime >= this.maxLifetime) {
      this.isActive = false;
      return;
    }

    this.position.add(this.velocity.clone().multiplyScalar(deltaTime));

    const blockX = Math.floor(this.position.x);
    const blockY = Math.floor(this.position.y);
    const blockZ = Math.floor(this.position.z);

    if (world.getBlock(blockX, blockY, blockZ) !== 0) {
      this.isActive = false;
      return;
    }

    this.mesh.position.copy(this.position);
  }

  getBoundingBox(): Box3 {
    return new Box3().setFromObject(this.mesh);
  }
}
