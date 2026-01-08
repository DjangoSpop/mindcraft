import { Scene, InstancedMesh, BoxGeometry, MeshLambertMaterial, Matrix4, Object3D } from 'three';
import { World } from '../world/World';
import { BlockType, BLOCK_DEFINITIONS } from '../world/BlockType';

export class BlockMeshBuilder {
  private scene: Scene;
  private instancedMeshes: Map<BlockType, InstancedMesh> = new Map();

  constructor(scene: Scene) {
    this.scene = scene;
  }

  clear() {
    for (const mesh of this.instancedMeshes.values()) {
      this.scene.remove(mesh);
      mesh.geometry.dispose();
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach(m => m.dispose());
      } else {
        mesh.material.dispose();
      }
    }
    this.instancedMeshes.clear();
  }

  build(world: World) {
    const blocksByType = new Map<BlockType, Array<{ x: number; y: number; z: number }>>();

    for (const block of world.getAllBlocks()) {
      if (block.type === BlockType.Air) continue;

      if (!blocksByType.has(block.type)) {
        blocksByType.set(block.type, []);
      }
      blocksByType.get(block.type)!.push({ x: block.x, y: block.y, z: block.z });
    }

    const geometry = new BoxGeometry(1, 1, 1);
    const dummy = new Object3D();

    for (const [type, blocks] of blocksByType) {
      const definition = BLOCK_DEFINITIONS[type];
      const material = new MeshLambertMaterial({ color: definition.color });
      const mesh = new InstancedMesh(geometry, material, blocks.length);

      blocks.forEach((block, index) => {
        dummy.position.set(block.x + 0.5, block.y + 0.5, block.z + 0.5);
        dummy.updateMatrix();
        mesh.setMatrixAt(index, dummy.matrix);
      });

      mesh.instanceMatrix.needsUpdate = true;
      this.scene.add(mesh);
      this.instancedMeshes.set(type, mesh);
    }
  }
}
