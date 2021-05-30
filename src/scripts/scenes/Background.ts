import Images from "../Images";
import { AgentState, AgentStrategy, StateDetails } from "../state/Agent";

export default class Background extends Phaser.Scene implements AgentStrategy {
  private state: "day" | "waiting" | "transitioning" = "day";
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

    this.tweens.add({
      targets: this.transitionOverlay,
      alpha: { from: 1, to: 0 },
      ease: "Sin.easeOut",
      duration: 1000
    })
  }

  tell(report: AgentState): void {
    if (report.state.name === "dayOver") {
      this.state = "waiting";
    } else if (report.state.name === "gameTime") {
      this.nightBackground.alpha =
        1 - Phaser.Math.Easing.Quadratic.InOut(Math.min(60, report.state.minute) / 60);
    }
  }

  tick(): StateDetails | undefined {
    if (this.state === "waiting") {
      this.startNextDayTransition();
      this.state = "transitioning";
    }

    return this.state === "transitioning"
      ? undefined
      : { name: "ignore" };
  }

  startNextDayTransition(): void {
    this.tweens.add({
      targets: this.transitionOverlay,
      alpha: { from: 0, to: 1 },
      ease: "Sin.easeOut",
      duration: 2000,
      yoyo: true,
      onYoyo: () => this.nightBackground.alpha = 1,
      onComplete: () => this.state = "day"
    })
  }
}