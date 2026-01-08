import { PerspectiveCamera, Vector3 } from 'three';
import { PlayerCharacter } from './PlayerCharacter';

export class CameraController {
  camera: PerspectiveCamera;
  private player: PlayerCharacter;
  private distance: number = 8;
  private height: number = 4;

  constructor(player: PlayerCharacter) {
    this.player = player;
    this.camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    window.addEventListener('resize', () => this.onResize());
  }

  private onResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }

  update(): void {
    const yaw = this.player.getYaw();

    const cameraOffset = new Vector3(
      -Math.sin(yaw) * this.distance,
      this.height,
      -Math.cos(yaw) * this.distance
    );

    this.camera.position.copy(this.player.position).add(cameraOffset);

    const lookAtTarget = this.player.position.clone();
    lookAtTarget.y += 1;
    this.camera.lookAt(lookAtTarget);
  }
}
