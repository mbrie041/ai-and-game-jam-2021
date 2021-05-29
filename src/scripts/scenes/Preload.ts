import Boot from "./Boot";

export default class Preload extends Phaser.Scene {
  private launched = false;

  constructor() {
    super({ key: Preload.name, active: true, visible: true });
  }

  preload(): void {
    this.load.image('logo', 'assets/phaser3-logo.png');
    this.load.image('libs', 'assets/libs.png');
    this.load.glsl('bundle', 'assets/plasma-bundle.glsl.js');
    this.load.glsl('stars', 'assets/starfields.glsl.js');
  }

  update(time: number): void {
    if (time < 10000) {
      return;
    }

    if (!this.launched) {
      this.scene.stop(Boot.name);
    }
    this.launched = true;
  }
}
