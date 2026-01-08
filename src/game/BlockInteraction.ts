import { Raycaster, Vector3, Vector2, BoxGeometry, MeshBasicMaterial, LineSegments, EdgesGeometry } from 'three';
import { GameState } from './GameState';
import { Renderer } from '../render/Renderer';
import { InputManager } from '../engine/InputManager';
import { BlockType } from '../world/BlockType';

export class BlockInteraction {
  private gameState: GameState;
  private renderer: Renderer;
  private raycaster: Raycaster;
  private highlightMesh: LineSegments | null = null;

  targetBlock: { x: number; y: number; z: number } | null = null;
  targetFace: Vector3 | null = null;

  constructor(gameState: GameState, renderer: Renderer, _inputManager: InputManager) {
    this.gameState = gameState;
    this.renderer = renderer;
    this.raycaster = new Raycaster();

    this.createHighlightMesh();

    window.addEventListener('keydown', (e) => {
      if (e.code === 'Digit1') this.gameState.setHotbarIndex(0);
      if (e.code === 'Digit2') this.gameState.setHotbarIndex(1);
      if (e.code === 'Digit3') this.gameState.setHotbarIndex(2);
    });

    window.addEventListener('mousedown', (e) => {
      if (document.pointerLockElement !== document.body) return;

      if (e.button === 0) {
        this.breakBlock();
      } else if (e.button === 2) {
        e.preventDefault();
        this.placeBlock();
      }
    });

    window.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  private createHighlightMesh() {
    const geometry = new BoxGeometry(1.01, 1.01, 1.01);
    const edges = new EdgesGeometry(geometry);
    this.highlightMesh = new LineSegments(edges, new MeshBasicMaterial({ color: 0x000000 }));
    this.highlightMesh.visible = false;
    this.renderer.scene.add(this.highlightMesh);
  }

  update() {
    this.raycastBlock();
    this.updateHighlight();
  }

  private raycastBlock() {
    const camera = this.renderer.getCurrentCamera();
    if (!camera) return;

    this.raycaster.setFromCamera(new Vector2(0, 0), camera);
    const ray = this.raycaster.ray;

    const maxDistance = 5;
    const step = 0.1;
    let currentDistance = 0;

    this.targetBlock = null;
    this.targetFace = null;

    while (currentDistance < maxDistance) {
      const point = ray.origin.clone().add(ray.direction.clone().multiplyScalar(currentDistance));
      const blockPos = {
        x: Math.floor(point.x),
        y: Math.floor(point.y),
        z: Math.floor(point.z)
      };

      if (this.gameState.world.getBlock(blockPos.x, blockPos.y, blockPos.z) !== BlockType.Air) {
        this.targetBlock = blockPos;

        const blockCenter = new Vector3(blockPos.x + 0.5, blockPos.y + 0.5, blockPos.z + 0.5);
        const localPoint = point.clone().sub(blockCenter);

        const absX = Math.abs(localPoint.x);
        const absY = Math.abs(localPoint.y);
        const absZ = Math.abs(localPoint.z);

        if (absX > absY && absX > absZ) {
          this.targetFace = new Vector3(Math.sign(localPoint.x), 0, 0);
        } else if (absY > absX && absY > absZ) {
          this.targetFace = new Vector3(0, Math.sign(localPoint.y), 0);
        } else {
          this.targetFace = new Vector3(0, 0, Math.sign(localPoint.z));
        }

        break;
      }

      currentDistance += step;
    }
  }

  private updateHighlight() {
    if (this.highlightMesh) {
      if (this.targetBlock) {
        this.highlightMesh.position.set(
          this.targetBlock.x + 0.5,
          this.targetBlock.y + 0.5,
          this.targetBlock.z + 0.5
        );
        this.highlightMesh.visible = true;
      } else {
        this.highlightMesh.visible = false;
      }
    }
  }

  private breakBlock() {
    if (!this.targetBlock) return;

    this.gameState.world.setBlock(this.targetBlock.x, this.targetBlock.y, this.targetBlock.z, BlockType.Air);
    this.renderer.rebuildWorld();
  }

  private placeBlock() {
    if (!this.targetBlock || !this.targetFace) return;

    const placePos = {
      x: this.targetBlock.x + this.targetFace.x,
      y: this.targetBlock.y + this.targetFace.y,
      z: this.targetBlock.z + this.targetFace.z
    };

    if (this.gameState.world.isInBounds(placePos.x, placePos.y, placePos.z)) {
      const selectedBlock = this.gameState.getSelectedBlockType();
      this.gameState.world.setBlock(placePos.x, placePos.y, placePos.z, selectedBlock);
      this.renderer.rebuildWorld();
    }
  }
}
