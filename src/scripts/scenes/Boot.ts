
export default class Boot extends Phaser.Scene {
  constructor() {
    super({ key: Boot.name, active: true, visible: true });
  }

  create(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const loadingIndicator = this.add.graphics();
    loadingIndicator
      .setPosition(width / 2, height / 2)
      .fillStyle(0xff0000, 1)
      .fillCircle(0, 0, 5);
    this.tweens.add({
      targets: loadingIndicator,
      alpha: { from: 1, to: 0 },
      duration: 2000,
      ease: 'Expo.easeInOut',
      yoyo: true,
      repeat: -1
    })
  }
}
