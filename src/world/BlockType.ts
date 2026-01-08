export enum BlockType {
  Air = 0,
  Dirt = 1,
  Grass = 2,
  Stone = 3,
}

export interface BlockDefinition {
  id: BlockType;
  name: string;
  color: number;
}

export const BLOCK_DEFINITIONS: Record<BlockType, BlockDefinition> = {
  [BlockType.Air]: { id: BlockType.Air, name: 'Air', color: 0x000000 },
  [BlockType.Dirt]: { id: BlockType.Dirt, name: 'Dirt', color: 0x8B4513 },
  [BlockType.Grass]: { id: BlockType.Grass, name: 'Grass', color: 0x7CFC00 },
  [BlockType.Stone]: { id: BlockType.Stone, name: 'Stone', color: 0x808080 },
};
