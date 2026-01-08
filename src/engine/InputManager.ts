export class InputManager {
  private keys: Set<string> = new Set();
  private mouseButtons: Set<number> = new Set();
  private mouseButtonsDown: Set<number> = new Set();
  private mouseButtonsUp: Set<number> = new Set();

  constructor() {
    window.addEventListener('keydown', (e) => this.keys.add(e.code));
    window.addEventListener('keyup', (e) => this.keys.delete(e.code));

    window.addEventListener('mousedown', (e) => {
      this.mouseButtons.add(e.button);
      this.mouseButtonsDown.add(e.button);
    });

    window.addEventListener('mouseup', (e) => {
      this.mouseButtons.delete(e.button);
      this.mouseButtonsUp.add(e.button);
    });

    window.addEventListener('blur', () => {
      this.keys.clear();
      this.mouseButtons.clear();
    });
  }

  isKeyPressed(code: string): boolean {
    return this.keys.has(code);
  }

  isMouseButtonPressed(button: number): boolean {
    return this.mouseButtons.has(button);
  }

  isMouseButtonDown(button: number): boolean {
    return this.mouseButtonsDown.has(button);
  }

  isMouseButtonUp(button: number): boolean {
    return this.mouseButtonsUp.has(button);
  }

  clearFrameState() {
    this.mouseButtonsDown.clear();
    this.mouseButtonsUp.clear();
  }

  update() {
    this.clearFrameState();
  }
}
