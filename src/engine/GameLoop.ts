import { Time } from './Time';

export class GameLoop {
  private running: boolean = false;
  private animationFrameId: number = 0;
  private updateCallback: (deltaTime: number) => void;
  private renderCallback: () => void;

  constructor(updateCallback: (deltaTime: number) => void, renderCallback: () => void) {
    this.updateCallback = updateCallback;
    this.renderCallback = renderCallback;
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.loop(performance.now());
  }

  stop() {
    this.running = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  private loop(currentTime: number) {
    if (!this.running) return;

    Time.update(currentTime);
    this.updateCallback(Time.deltaTime);
    this.renderCallback();

    this.animationFrameId = requestAnimationFrame(this.loop.bind(this));
  }
}
