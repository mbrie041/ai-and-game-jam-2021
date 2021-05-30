import Images from "../Images";
import { AgentState, AgentStrategy, StateDetails } from "../state/Agent";

export default class Background extends Phaser.Scene implements AgentStrategy {
  private state: "wait" | "dayOver" | "dayStart" | "transitioning" = "wait";
  private transitionOverlay: Phaser.GameObjects.Rectangle;
  private gameTime: { day: number; minute: number; } | undefined;
  private nightBackground: Phaser.GameObjects.Image;
  dayBackground: Phaser.GameObjects.Image;

  create(): void {
    this.dayBackground = this.add.image(0, 0, Images.Market.Light.key).setOrigin(0, 0);
    this.nightBackground = this.add.image(0, 0, Images.Market.Dark.key).setOrigin(0, 0);
    this.transitionOverlay = this.add
      .rectangle(0, 0, this.nightBackground.width, this.nightBackground.height, 0x000000)
      .setOrigin(0, 0);
  }

  tell(report: AgentState): void {
    switch (report.state.name) {
      case "dayOver":
        this.state = "dayOver";
        break;
      case "dayStart":
        this.state = "dayStart";
        break;
      case "gameTime":
        this.nightBackground.alpha =
          1 - Phaser.Math.Easing.Quadratic.InOut(Math.min(60, report.state.minute) / 60);
        break;
    }
  }

  tick(): StateDetails | undefined {
    switch (this.state) {
      case "dayOver":
        this.startEndDayTransition();
        return undefined;
      case "dayStart":
        this.startStartDayTransition();
        return undefined;
      case "transitioning":
        return undefined;
      case "wait":
        return { name: "ignore" };
    }
  }

  startEndDayTransition(): void {
    this.state = "transitioning";
    this.tweens.add({
      targets: this.transitionOverlay,
      alpha: { from: 0, to: 1 },
      ease: "Sin.easeOut",
      duration: 1000,
      onComplete: () => this.state = "wait"
    });
  }

  startStartDayTransition(): void {
    this.state = "transitioning";
    this.nightBackground.alpha = 1;
    this.tweens.add({
      targets: this.transitionOverlay,
      alpha: { from: 1, to: 0 },
      ease: "Sin.easeIn",
      duration: 1000,
      onComplete: () => this.state = "wait"
    });
  }
}