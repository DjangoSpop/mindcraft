import { PlayerCharacter } from './PlayerCharacter';
import { CombatSystem } from './CombatSystem';
import { Time } from '../engine/Time';

export class ShooterUI {
  private player: PlayerCharacter;
  private combatSystem: CombatSystem;

  private fpsElement: HTMLElement | null;
  private healthElement: HTMLElement | null;
  private scoreElement: HTMLElement | null;
  private enemyCountElement: HTMLElement | null;

  constructor(player: PlayerCharacter, combatSystem: CombatSystem) {
    this.player = player;
    this.combatSystem = combatSystem;

    this.fpsElement = document.getElementById('fps');
    this.healthElement = document.getElementById('health');
    this.scoreElement = document.getElementById('score');
    this.enemyCountElement = document.getElementById('enemy-count');
  }

  update(): void {
    if (this.fpsElement) {
      this.fpsElement.textContent = Time.fps.toString();
    }

    if (this.healthElement) {
      const healthPercent = (this.player.health / this.player.maxHealth) * 100;
      this.healthElement.textContent = `${Math.ceil(healthPercent)}%`;
    }

    if (this.scoreElement) {
      this.scoreElement.textContent = this.combatSystem.getScore().toString();
    }

    if (this.enemyCountElement) {
      this.enemyCountElement.textContent = this.combatSystem.getEnemyCount().toString();
    }

    if (this.player.health <= 0) {
      this.showGameOver();
    }
  }

  private showGameOver(): void {
    const gameOverDiv = document.getElementById('game-over');
    if (gameOverDiv) {
      gameOverDiv.classList.remove('hidden');
      const finalScore = document.getElementById('final-score');
      if (finalScore) {
        finalScore.textContent = this.combatSystem.getScore().toString();
      }
    }
  }
}
