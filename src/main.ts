import { GameState } from './game/GameState';
import { GameLoop } from './engine/GameLoop';
import { Renderer } from './render/Renderer';
import { InputManager } from './engine/InputManager';
import { Player } from './game/Player';
import { BlockInteraction } from './game/BlockInteraction';
import { UI } from './game/UI';

class Game {
  private gameState: GameState;
  private renderer: Renderer;
  private inputManager: InputManager;
  private player: Player;
  private blockInteraction: BlockInteraction;
  private ui: UI;
  private gameLoop: GameLoop;

  constructor() {
    this.gameState = new GameState();
    this.renderer = new Renderer(this.gameState);
    this.inputManager = new InputManager();
    this.player = new Player(this.gameState, this.inputManager);
    this.blockInteraction = new BlockInteraction(this.gameState, this.renderer, this.inputManager);
    this.ui = new UI(this.gameState, this.player, this.blockInteraction);
    this.gameLoop = new GameLoop(this.update.bind(this), this.render.bind(this));
  }

  start() {
    const startButton = document.getElementById('start-button');
    const instructions = document.getElementById('instructions');

    startButton?.addEventListener('click', () => {
      instructions?.classList.add('hidden');
      this.renderer.lockPointer();
      this.gameLoop.start();
    });
  }

  private update(deltaTime: number) {
    this.player.update(deltaTime);
    this.blockInteraction.update();
    this.ui.update();
  }

  private render() {
    this.renderer.render(this.player.camera);
  }
}

const game = new Game();
game.start();
