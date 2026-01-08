export class Time {
  static deltaTime: number = 0;
  static fps: number = 0;
  private static lastTime: number = 0;
  private static frameCount: number = 0;
  private static fpsTime: number = 0;

  static update(currentTime: number) {
    this.deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.1);
    this.lastTime = currentTime;

    this.frameCount++;
    this.fpsTime += this.deltaTime;

    if (this.fpsTime >= 1.0) {
      this.fps = Math.round(this.frameCount / this.fpsTime);
      this.frameCount = 0;
      this.fpsTime = 0;
    }
  }
}
