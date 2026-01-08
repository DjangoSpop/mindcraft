import { PlayerCharacter } from './PlayerCharacter';
import { Enemy } from './Enemy';
import { Projectile } from './Projectile';
import { InputManager } from '../engine/InputManager';
import { World } from '../world/World';
import { Scene, Vector3 } from 'three';

export class CombatSystem {
  private player: PlayerCharacter;
  private enemies: Enemy[] = [];
  private projectiles: Projectile[] = [];
  private world: World;
  private scene: Scene;
  private shootCooldown: number = 0;
  private shootCooldownTime: number = 0.3;
  private score: number = 0;
  private enemySpawnTimer: number = 0;
  private enemySpawnInterval: number = 5.0;
  private maxEnemies: number = 5;

  constructor(player: PlayerCharacter, _inputManager: InputManager, world: World, scene: Scene) {
    this.player = player;
    this.world = world;
    this.scene = scene;

    this.spawnInitialEnemies();

    window.addEventListener('mousedown', (e) => {
      if (document.pointerLockElement !== document.body) return;
      if (e.button === 0) {
        this.shoot();
      }
    });
  }

  private spawnInitialEnemies(): void {
    for (let i = 0; i < 3; i++) {
      this.spawnEnemy();
    }
  }

  private spawnEnemy(): void {
    const spawnRadius = 15;
    const angle = Math.random() * Math.PI * 2;
    const distance = 8 + Math.random() * spawnRadius;

    const spawnPos = new Vector3(
      16 + Math.cos(angle) * distance,
      10,
      16 + Math.sin(angle) * distance
    );

    const enemy = new Enemy(this.world, spawnPos);
    this.enemies.push(enemy);
    this.scene.add(enemy.sprite);
  }

  private shoot(): void {
    if (this.shootCooldown > 0) return;

    const shootOrigin = this.player.position.clone();
    shootOrigin.y += 0.5;

    const direction = this.player.getShootDirection();
    const projectile = new Projectile(shootOrigin, direction);

    this.projectiles.push(projectile);
    this.scene.add(projectile.mesh);

    this.shootCooldown = this.shootCooldownTime;
  }

  update(deltaTime: number): void {
    this.shootCooldown = Math.max(0, this.shootCooldown - deltaTime);

    this.updateProjectiles(deltaTime);
    this.updateEnemies(deltaTime);
    this.checkCollisions();
    this.spawnEnemiesIfNeeded(deltaTime);
  }

  private updateProjectiles(deltaTime: number): void {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const projectile = this.projectiles[i];
      projectile.update(deltaTime, this.world);

      if (!projectile.isActive) {
        this.scene.remove(projectile.mesh);
        this.projectiles.splice(i, 1);
      }
    }
  }

  private updateEnemies(deltaTime: number): void {
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      enemy.update(deltaTime);

      if (!enemy.isAlive) {
        this.scene.remove(enemy.sprite);
        this.enemies.splice(i, 1);
      }
    }
  }

  private checkCollisions(): void {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const projectile = this.projectiles[i];
      if (!projectile.isActive) continue;

      const projectileBox = projectile.getBoundingBox();

      for (let j = this.enemies.length - 1; j >= 0; j--) {
        const enemy = this.enemies[j];
        if (!enemy.isAlive) continue;

        const enemyBox = enemy.getBoundingBox();

        if (projectileBox.intersectsBox(enemyBox)) {
          enemy.takeDamage(projectile.damage);
          projectile.isActive = false;
          this.scene.remove(projectile.mesh);
          this.projectiles.splice(i, 1);

          if (!enemy.isAlive) {
            this.score += 100;
          }
          break;
        }
      }
    }

    for (const enemy of this.enemies) {
      if (!enemy.isAlive) continue;

      const enemyBox = enemy.getBoundingBox();
      const playerBox = this.player.getBoundingBox();

      if (enemyBox.intersectsBox(playerBox)) {
        this.player.takeDamage(10 * 0.016);
      }
    }
  }

  private spawnEnemiesIfNeeded(deltaTime: number): void {
    if (this.enemies.length >= this.maxEnemies) return;

    this.enemySpawnTimer += deltaTime;
    if (this.enemySpawnTimer >= this.enemySpawnInterval) {
      this.spawnEnemy();
      this.enemySpawnTimer = 0;
    }
  }

  getScore(): number {
    return this.score;
  }

  getEnemyCount(): number {
    return this.enemies.length;
  }
}
