import { FontDefaults } from "../Fonts";
import Images from "../Images";
import { AgentStrategy, GameTime, StateDetails, StateReport } from "../state/Agent";

export default class TimeUi extends Phaser.Scene implements AgentStrategy {
  private days = ["Friday", "Saturday", "Sunday"];
  private day = "";
  private animating = false;

  timeText: Phaser.GameObjects.Text;
  tell(report: StateReport): void {
    switch (report.state.name) {
      case "dayStart":
        this.day = this.days[report.state.day];
        this.timeText.setText(`${this.day}, dawn`);
        break;
      case "dayOver":
        this.timeText.setText(`${this.day}, afternoon`);
        break;
      case "gameTime":
        this.updateClockTime(report.state);
        break;
      default:
        break;
    }
  }

  tick(): StateDetails[] | undefined {
    return this.animating ? undefined : []
  }
  create(): void {
    const background = this.add
      .image(this.cameras.main.width, 0, Images.Dialog.NarrowShort.key)
      .setOrigin(1, 0);

    this.timeText = this.add
      .text(background.x + 30, background.y + background.height / 2 - 4, "", FontDefaults)
      .setFixedSize(background.width, 0)
      .setOrigin(1, 0.5);

    this.tweens.add({
      targets: this.cameras.main,
      y: { from: -100, to: 0 },
      duration: 1000,
      ease: Phaser.Math.Easing.Bounce.Out,
    })
  }

  private updateClockTime(state: GameTime) {
    const hour = 6 + Math.floor(state.minute / 60);
    const minute = state.minute % 60;
    this.updateTime(`${this.day}, ${hour}:${minute.toFixed(0).padStart(2, "0")}am`);
  }

  private updateTime(nextTime: string): void {
    this.animating = true;
    this.tweens.add({
      targets: this.cameras.main,
      y: { from: 0, to: -100 },
      duration: 300,
      ease: Phaser.Math.Easing.Bounce.In,
      onComplete: () => this.showNextTime(nextTime)
    })
  }

  showNextTime(nextTime: string): void {
    this.timeText.setText(nextTime);
    this.tweens.add({
      targets: this.cameras.main,
      y: { from: -100, to: 0 },
      duration: 500,
      ease: Phaser.Math.Easing.Bounce.Out,
      onComplete: () => this.animating = false
    })
  }
}