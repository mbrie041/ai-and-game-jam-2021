import Images from "../Images";
import Main from "./Main";

export default class Boot extends Phaser.Scene {
  private loadingIndicator: Phaser.GameObjects.Graphics;
  private background: Phaser.GameObjects.Rectangle;
  loadingTween: Phaser.Tweens.Tween;

  constructor() {
    super({ key: Boot.name, active: true, visible: true });
  }

  preload(): void {
    this.load.image(Images.Market.Dark);
    this.load.image(Images.Market.Light);

    this.createProgressIndicator();
  }

  private createProgressIndicator() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    this.background = this.add.rectangle(width / 2, height / 2, width, height, 0xffffff);
    this.loadingIndicator = this.add.graphics();
    this.loadingIndicator
      .setPosition(width / 2, height / 2)
      .fillStyle(0xff0000, 1)
      .fillCircle(0, 0, 20);
    this.loadingTween = this.tweens.add({
      targets: this.loadingIndicator,
      alpha: { from: 1, to: 0 },
      duration: 1000,
      ease: 'Quad.easeInOut',
      yoyo: true,
      repeat: -1
    });
  }

  create(): void {
    this.scene.transition({ target: Main.name, duration: 3000, moveBelow: true })
    this.loadingTween.stop();
  }

  update(): void {
    this.loadingIndicator.alpha *= 1 - (this.scene.transitionProgress * 3 ?? 0);
    this.background.alpha *= 1 - Phaser.Math.Easing.Quadratic.InOut(this.scene.transitionProgress ?? 0);
  }
}
