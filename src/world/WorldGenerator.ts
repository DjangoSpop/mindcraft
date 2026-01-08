import { World } from './World';
import { BlockType } from './BlockType';

export class WorldGenerator {
  static generateFlat(world: World) {
    for (let x = 0; x < world.sizeX; x++) {
      for (let z = 0; z < world.sizeZ; z++) {
        world.setBlock(x, 0, z, BlockType.Stone);
        world.setBlock(x, 1, z, BlockType.Dirt);
        world.setBlock(x, 2, z, BlockType.Dirt);
        world.setBlock(x, 3, z, BlockType.Grass);
      }
    }
  }
}
