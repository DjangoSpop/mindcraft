import { World } from '../world/World';
import { WorldGenerator } from '../world/WorldGenerator';
import { BlockType } from '../world/BlockType';

export class GameState {
  world: World;
  hotbarSlots: BlockType[] = [BlockType.Dirt, BlockType.Grass, BlockType.Stone];
  selectedHotbarIndex: number = 0;

  constructor() {
    this.world = new World(32, 16, 32);
    WorldGenerator.generateFlat(this.world);
  }

  getSelectedBlockType(): BlockType {
    return this.hotbarSlots[this.selectedHotbarIndex];
  }

  setHotbarIndex(index: number) {
    if (index >= 0 && index < this.hotbarSlots.length) {
      this.selectedHotbarIndex = index;
    }
  }
}
