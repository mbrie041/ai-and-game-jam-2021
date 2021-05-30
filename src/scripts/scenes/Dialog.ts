import Images from "../Images";
import { FontDefaults } from "../Fonts";
import { Agent, AgentStrategy, CharacterDialog, StateDetails, StateReport } from "../state/Agent";

export default class Dialog extends Phaser.Scene implements AgentStrategy {
  private pendingDialogs: [agent: Agent, dialog: CharacterDialog][] = [];
  private isShowingDialog = false;
  private avatar: Phaser.GameObjects.Image;
  private title: Phaser.GameObjects.Text;
  private content: Phaser.GameObjects.Text;
  close: Phaser.GameObjects.Text;

  tell(report: StateReport): void {
    if (report.state.name === "dialog") {
      this.pendingDialogs.push([report.source, report.state]);
    }
  }

  tick(): StateDetails[] | undefined {
    if (this.isShowingDialog) {
      return undefined;
    }

    const next = this.pendingDialogs.pop();
    if (next === undefined) {
      return []
    }

    this.showDialog(next);
    return undefined;
  }

  create(): void {
    this.add
      .image(0, 0, Images.Dialog.WideTall.key)
      .setOrigin(0, 0);

    this.title = this.add
      .text(58, 24, "Heloow there!", { ...FontDefaults, fontStyle: 'bold' })
      .setOrigin(0, 0);

    this.close = this.add
      .text(434, 24, "✗", { ...FontDefaults, fontStyle: 'bold' })
      .setInteractive()
      .setOrigin(0, 0);

    this.content = this.add
      .text(28, 64, "the quick brown fox jumped over".repeat(20), {
        ...FontDefaults,
        fontSize: '24px',
        fixedHeight: 226,
        wordWrap: { width: 428 }
      })
      .setOrigin(0, 0);

    this.avatar = this.add
      .image(0, 0, "")
      .setOrigin(0, 0)
      .setScale(0.5);

    this.cameras.main.y = -500;
  }


  showDialog(next: [agent: Agent, dialog: CharacterDialog]): void {
    this.avatar.setTexture(next[0].icon ?? "");
    this.avatar.visible = next[0].icon !== null;
    this.close.once("pointerdown", () => this.closeDialog());
    this.tweens.add({
      targets: this.cameras.main,
      y: { from: -500, to: 0 },
      duration: 500,
      ease: Phaser.Math.Easing.Bounce.Out
    })
  }

  closeDialog(): void {
    this.tweens.add({
      targets: this.cameras.main,
      y: { from: 0, to: -500 },
      duration: 300,
      ease: Phaser.Math.Easing.Bounce.In,
      onComplete: () => this.isShowingDialog = false
    })
  }

}