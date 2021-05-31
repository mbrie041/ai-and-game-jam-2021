import Images from "../Images";
import { Agent, AgentStrategy, StateDetails, StateReport, Waiting } from "../state/Agent";
import { FontDefaults, Interactive } from "../Styles";

export default class PlayerInterface extends Phaser.Scene implements AgentStrategy {
  private nextAction: StateDetails | undefined;
  private currentlyWaiting: (Waiting & { agent: Agent })[] = [];
  private waiterTextboxes: Phaser.GameObjects.Text[] = [];
  private isShowingList = false;

  tell(report: StateReport): void {
    if (report.state.name === "waiting") {
      this.currentlyWaiting.push({ agent: report.source, ...report.state })
    }
  }

  tick(): StateDetails[] | undefined {
    if (this.currentlyWaiting.length === 0) {
      return [];
    }

    if (!this.isShowingList) {
      this.showList();
      return undefined;
    }

    if (this.nextAction === undefined) {
      return undefined;
    }

    // Is this better than assigning a temporary variable??
    try {
      return [this.nextAction];
    } finally {
      this.nextAction = undefined;
      this.currentlyWaiting = [];
    }
  }

  create(): void {
    this.add
      .image(this.cameras.main.width, 80, Images.Dialog.NarrowTall.key)
      .setOrigin(1, 0);
    this.add
      .text(this.cameras.main.width - 304, 100, "Waiting", { ...FontDefaults, fontStyle: 'bold' })
      .setOrigin(0, 0);

    this.cameras.main.x = 500;
  }


  showList(): void {
    this.isShowingList = true;
    const x = this.cameras.main.width - 304;
    let y = 136;

    for (const item of this.currentlyWaiting) {
      const text = this.add
        .text(x, y, item.agent.name, { ...Interactive, fontSize: '24px', fontStyle: 'normal' })
        .setOrigin(0, 0)
        .on(Phaser.Input.Events.POINTER_DOWN, () => this.clicked(item));
      this.waiterTextboxes.push(text);
      y += text.height;
    }

    this.tweens.add({
      targets: this.cameras.main,
      x: { from: 400, to: 0 },
      duration: 800,
      ease: Phaser.Math.Easing.Bounce.Out
    })
  }

  clicked(item: Waiting & { agent: Agent; }): void {
  }

}