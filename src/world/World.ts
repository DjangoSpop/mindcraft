import { BlockType } from './BlockType';

export class World {
  readonly sizeX: number;
  readonly sizeY: number;
  readonly sizeZ: number;
  private blocks: Map<string, BlockType> = new Map();

  constructor(sizeX: number = 32, sizeY: number = 16, sizeZ: number = 32) {
    this.sizeX = sizeX;
    this.sizeY = sizeY;
    this.sizeZ = sizeZ;
  }

  private getKey(x: number, y: number, z: number): string {
    return `${x},${y},${z}`;
  }

  getBlock(x: number, y: number, z: number): BlockType {
    if (!this.isInBounds(x, y, z)) return BlockType.Air;
    return this.blocks.get(this.getKey(x, y, z)) ?? BlockType.Air;
  }

  setBlock(x: number, y: number, z: number, type: BlockType) {
    if (!this.isInBounds(x, y, z)) return;

    if (type === BlockType.Air) {
      this.blocks.delete(this.getKey(x, y, z));
    } else {
      this.blocks.set(this.getKey(x, y, z), type);
    }
  }

  isInBounds(x: number, y: number, z: number): boolean {
    return x >= 0 && x < this.sizeX &&
           y >= 0 && y < this.sizeY &&
           z >= 0 && z < this.sizeZ;
  }

  *getAllBlocks(): Generator<{ x: number; y: number; z: number; type: BlockType }> {
    for (const [key, type] of this.blocks) {
      const [x, y, z] = key.split(',').map(Number);
      yield { x, y, z, type };
    }
  }

  serialize(): string {
    const data: [number, number, number, BlockType][] = [];
    for (const block of this.getAllBlocks()) {
      data.push([block.x, block.y, block.z, block.type]);
    }
    return JSON.stringify({ sizeX: this.sizeX, sizeY: this.sizeY, sizeZ: this.sizeZ, blocks: data });
  }

  static deserialize(json: string): World {
    const data = JSON.parse(json);
    const world = new World(data.sizeX, data.sizeY, data.sizeZ);
    for (const [x, y, z, type] of data.blocks) {
      world.setBlock(x, y, z, type);
    }
    return world;
  }
}
