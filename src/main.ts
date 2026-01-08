import { GameState } from './game/GameState';
import { GameLoop } from './engine/GameLoop';
import { Renderer } from './render/Renderer';
import { InputManager } from './engine/InputManager';
import { PlayerCharacter } from './game/PlayerCharacter';
import { CameraController } from './game/CameraController';
import { CombatSystem } from './game/CombatSystem';
import { ShooterUI } from './game/ShooterUI';

class Game {
  private gameState: GameState;
  private renderer: Renderer;
  private inputManager: InputManager;
  private playerCharacter: PlayerCharacter;
  private cameraController: CameraController;
  private combatSystem: CombatSystem;
  private ui: ShooterUI;
  private gameLoop: GameLoop;

  constructor() {
    this.gameState = new GameState();
    this.renderer = new Renderer(this.gameState);
    this.inputManager = new InputManager();
    this.playerCharacter = new PlayerCharacter(this.inputManager, this.gameState.world);
    this.cameraController = new CameraController(this.playerCharacter);
    this.combatSystem = new CombatSystem(
      this.playerCharacter,
      this.inputManager,
      this.gameState.world,
      this.renderer.scene
    );
    this.ui = new ShooterUI(this.playerCharacter, this.combatSystem);
    this.gameLoop = new GameLoop(this.update.bind(this), this.render.bind(this));

    this.renderer.scene.add(this.playerCharacter.sprite);
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
    this.playerCharacter.update(deltaTime);
    this.combatSystem.update(deltaTime);
    this.cameraController.update();
    this.ui.update();
    this.inputManager.update();
  }

  private render() {
    this.renderer.render(this.cameraController.camera);
  }
}

const game = new Game();
game.start();
