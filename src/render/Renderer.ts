import { Scene, PerspectiveCamera, WebGLRenderer, AmbientLight, DirectionalLight, Color } from 'three';
import { GameState } from '../game/GameState';
import { BlockMeshBuilder } from './BlockMeshBuilder';

export class Renderer {
  scene: Scene;
  private renderer: WebGLRenderer;
  private gameState: GameState;
  private blockMeshBuilder: BlockMeshBuilder;
  private currentCamera: PerspectiveCamera | null = null;

  constructor(gameState: GameState) {
    this.gameState = gameState;

    this.scene = new Scene();
    this.scene.background = new Color(0x87CEEB);

    const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
    this.renderer = new WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    const ambientLight = new AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const directionalLight = new DirectionalLight(0xffffff, 0.4);
    directionalLight.position.set(10, 20, 10);
    this.scene.add(directionalLight);

    this.blockMeshBuilder = new BlockMeshBuilder(this.scene);
    this.buildWorld();

    window.addEventListener('resize', () => this.onResize());
  }

  private onResize() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  lockPointer() {
    document.body.requestPointerLock();
  }

  getCurrentCamera(): PerspectiveCamera | null {
    return this.currentCamera;
  }

  buildWorld() {
    this.blockMeshBuilder.clear();
    this.blockMeshBuilder.build(this.gameState.world);
  }

  rebuildWorld() {
    this.buildWorld();
  }

  render(camera: PerspectiveCamera) {
    this.currentCamera = camera;
    this.renderer.render(this.scene, camera);
  }
}
