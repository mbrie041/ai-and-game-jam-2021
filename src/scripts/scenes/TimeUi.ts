import { FontDefaults } from "../Styles";
import Images from "../Images";
import { AgentStrategy, GameTime, StateDetails, StateReport } from "../state/Agent";

export default class TimeUi extends Phaser.Scene implements AgentStrategy {
  private days = ["Friday", "Saturday", "Sunday"];
  private day = "";
  private pauseGame = false;
  private nextAction: StateDetails | undefined;

  timeText: Phaser.GameObjects.Text;
  tell(report: StateReport): void {
    switch (report.state.name) {
      case "dayStart":
      case "dayOver":
      case "gameTime":
        this.nextAction = report.state;
        break;
      default:
        break;
    }
  }

  tick(): StateDetails[] | undefined {
    if (this.nextAction) {
      switch (this.nextAction.name) {
        case "dayStart":
          this.day = this.days[this.nextAction.day];
          this.updateTime(`${this.day}, dawn`);
          break;
        case "dayOver":
          this.updateTime(`${this.day}, afternoon`);
          break;
        case "gameTime":
          this.updateClockTime(this.nextAction);
          break;
        default:
          break;
      }
      this.nextAction = undefined;
    }
    return this.pauseGame ? undefined : []
  }

  create(): void {
    const background = this.add
      .image(this.cameras.main.width, 0, Images.Dialog.NarrowShort.key)
      .setOrigin(1, 0);

    this.timeText = this.add
      .text(background.x + 30, background.y + background.height / 2 - 4, "", FontDefaults)
      .setFixedSize(background.width, 0)
      .setOrigin(1, 0.5);

    this.cameras.main.y = -100;
  }

  private updateClockTime(state: GameTime) {
    const hour = 6 + Math.floor(state.minute / 60);
    const minute = state.minute % 60;
    this.updateTime(`${this.day}, ${hour}:${minute.toFixed(0).padStart(2, "0")}am`);
  }

  private updateTime(nextTime: string): void {
    if (this.cameras.main.y < 0) {
      this.showNextTime(nextTime)
      return;
    }

    this.pauseGame = true;
    this.tweens.add({
      targets: this.cameras.main,
      y: { from: 0, to: -100 },
      duration: 300,
      ease: Phaser.Math.Easing.Bounce.In,
      onComplete: () => this.showNextTime(nextTime)
    })
  }

  showNextTime(nextTime: string): void {
    this.pauseGame = false;
    this.timeText.setText(nextTime);
    this.tweens.add({
      targets: this.cameras.main,
      y: { from: -100, to: 0 },
      duration: 500,
      ease: Phaser.Math.Easing.Bounce.Out
    })
  }
}