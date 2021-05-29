import Images from "../Images";

export default class Main extends Phaser.Scene {
  nightBackground: Phaser.GameObjects.Image;
  constructor() {
    super({ key: Main.name });
  }

  create(): void {
    const dayBackground = this.add.image(0, 0, Images.Market.Light.key).setOrigin(0, 0);
    this.nightBackground = this.add.image(0, 0, Images.Market.Dark.key).setOrigin(0, 0);
  }
}
