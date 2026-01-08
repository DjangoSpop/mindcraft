import { GameState } from './GameState';
import { Player } from './Player';
import { BlockInteraction } from './BlockInteraction';
import { Time } from '../engine/Time';
import { BLOCK_DEFINITIONS } from '../world/BlockType';

export class UI {
  private gameState: GameState;
  private player: Player;
  private blockInteraction: BlockInteraction;

  private fpsElement: HTMLElement | null;
  private positionElement: HTMLElement | null;
  private selectedBlockElement: HTMLElement | null;
  private hotbarIndexElement: HTMLElement | null;
  private hotbarSlots: NodeListOf<Element>;

  constructor(gameState: GameState, player: Player, blockInteraction: BlockInteraction) {
    this.gameState = gameState;
    this.player = player;
    this.blockInteraction = blockInteraction;

    this.fpsElement = document.getElementById('fps');
    this.positionElement = document.getElementById('position');
    this.selectedBlockElement = document.getElementById('selected-block');
    this.hotbarIndexElement = document.getElementById('hotbar-index');
    this.hotbarSlots = document.querySelectorAll('.hotbar-slot');
  }

  update() {
    if (this.fpsElement) {
      this.fpsElement.textContent = Time.fps.toString();
    }

    if (this.positionElement) {
      const pos = this.player.camera.position;
      this.positionElement.textContent = `${pos.x.toFixed(1)}, ${pos.y.toFixed(1)}, ${pos.z.toFixed(1)}`;
    }

    if (this.selectedBlockElement) {
      if (this.blockInteraction.targetBlock) {
        const block = this.blockInteraction.targetBlock;
        const type = this.gameState.world.getBlock(block.x, block.y, block.z);
        this.selectedBlockElement.textContent = `${BLOCK_DEFINITIONS[type].name} (${block.x}, ${block.y}, ${block.z})`;
      } else {
        this.selectedBlockElement.textContent = 'None';
      }
    }

    if (this.hotbarIndexElement) {
      this.hotbarIndexElement.textContent = (this.gameState.selectedHotbarIndex + 1).toString();
    }

    this.hotbarSlots.forEach((slot, index) => {
      if (index === this.gameState.selectedHotbarIndex) {
        slot.classList.add('active');
      } else {
        slot.classList.remove('active');
      }
    });
  }
}
