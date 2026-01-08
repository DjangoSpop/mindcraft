import { Sprite, SpriteMaterial, TextureLoader, Vector3, Box3 } from 'three';

export abstract class Entity {
  sprite: Sprite;
  position: Vector3;
  velocity: Vector3;
  health: number;
  maxHealth: number;
  isAlive: boolean;

  constructor(texturePath: string, health: number = 100) {
    const textureLoader = new TextureLoader();
    const texture = textureLoader.load(texturePath);
    const material = new SpriteMaterial({ map: texture });
    this.sprite = new Sprite(material);

    this.position = new Vector3();
    this.velocity = new Vector3();
    this.health = health;
    this.maxHealth = health;
    this.isAlive = true;

    this.sprite.scale.set(1, 1, 1);
  }

  takeDamage(amount: number): void {
    this.health -= amount;
    if (this.health <= 0) {
      this.health = 0;
      this.isAlive = false;
    }
  }

  getBoundingBox(): Box3 {
    return new Box3().setFromObject(this.sprite);
  }

  abstract update(deltaTime: number): void;

  updatePosition(): void {
    this.sprite.position.copy(this.position);
  }
}
