import Images from "../Images";
import { Agent, AgentStrategy, ContextSpecificAction, StateDetails, StateReport, Waiting } from "../state/Agent";
import { ClickCursor, FontDefaults, Interactive } from "../Styles";

export default class PlayerInterface extends Phaser.Scene implements AgentStrategy {
  private nextAction: StateDetails | undefined;
  private currentlyWaiting: (Waiting & { agent: Agent })[] = [];
  private waiterTextboxes: Phaser.GameObjects.Text[] = [];
  private isShowingList = false;
  private visitorDetailsContainer: Phaser.GameObjects.Container;
  private visitorAvatar: Phaser.GameObjects.Image;
  private visitorContent: Phaser.GameObjects.Text;
  private visitorTitle: Phaser.GameObjects.Text;
  private visitorTextboxes: Phaser.GameObjects.Text[] = [];
  waiterBox: Phaser.GameObjects.Image;
  waiterTitle: Phaser.GameObjects.Text;

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
    this.waiterBox = this.add
      .image(500 + this.cameras.main.width, 80, Images.Dialog.NarrowTall.key)
      .setOrigin(1, 0);
    this.waiterTitle = this.add
      .text(500 + this.cameras.main.width - 304, 100, "Waiting", { ...FontDefaults, fontStyle: 'bold' })
      .setOrigin(0, 0);

    this.visitorAvatar = this.add
      .image(0, 4, "")
      .setOrigin(0, 0)
      .setScale(0.5);
    this.visitorTitle = this.add
      .text(58, 24, "", { ...FontDefaults, fontStyle: 'bold' })
      .setOrigin(0, 0);
    this.visitorContent = this.add
      .text(28, 64, "", {
        ...FontDefaults,
        fontSize: '24px',
        wordWrap: { width: 428 }
      })
      .setOrigin(0, 0);

    this.visitorDetailsContainer = this.add.container(-500, 0);
    this.visitorDetailsContainer.add(this.add
      .image(0, 0, Images.Dialog.WideTall.key)
      .setOrigin(0, 0))
    this.visitorDetailsContainer.add(this.visitorAvatar);
    this.visitorDetailsContainer.add(this.visitorTitle);
    this.visitorDetailsContainer.add(this.visitorContent);
  }

  showList(): void {
    this.isShowingList = true;
    const x = 500 + this.cameras.main.width - 304;
    let y = 136;

    for (const item of this.currentlyWaiting) {
      const text = this.add
        .text(x, y, item.agent.name, { ...Interactive, fontSize: '24px', fontStyle: 'small-caps' })
        .setOrigin(0, 0)
        .setInteractive(ClickCursor)
        .on(Phaser.Input.Events.POINTER_DOWN, () => this.clicked(item));
      this.waiterTextboxes.push(text);
      y += text.height;
    }

    this.tweens.add({
      targets: [...this.waiterTextboxes, this.waiterBox, this.waiterTitle],
      x: '+=-500',
      duration: 800,
      ease: Phaser.Math.Easing.Bounce.Out
    })
  }

  clicked(item: Waiting & { agent: Agent; }): void {
    if (this.visitorDetailsContainer.x >= 0) {
      this.tweens.add({
        targets: this.visitorDetailsContainer,
        x: { from: 0, to: -500 },
        duration: 300,
        ease: Phaser.Math.Easing.Quadratic.Out,
        onComplete: () => this.clicked(item)
      })
      return;
    }

    // Clean up any old text extra actions.
    for (const item of this.visitorTextboxes) {
      this.visitorDetailsContainer.remove(item, true);
    }

    // Set up the dialog.
    this.visitorAvatar.setTexture(item.agent.icon ?? "");
    this.visitorAvatar.visible = item.agent.icon !== null;

    this.visitorTitle.setText(item.agent.name);
    this.visitorContent.setText(item.appearance);

    let x = 28;
    const y = 240;

    for (const option of item.actions) {
      const text = this.add
        .text(x, y, option.label, {
          ...Interactive,
          fontSize: '24px',
          fontStyle: 'small-caps'
        })
        .setOrigin(0, 0)
        .setInteractive(ClickCursor)
        .on(Phaser.Input.Events.POINTER_DOWN, () => this.actionSelected(option));
      this.visitorTextboxes.push(text);
      this.visitorDetailsContainer.add(text);
      x += text.width + 16;
    }

    this.tweens.add({
      targets: this.visitorDetailsContainer,
      x: { from: -500, to: 0 },
      duration: 800,
      ease: Phaser.Math.Easing.Bounce.Out
    })
  }

  actionSelected(option: StateDetails): void {
    this.nextAction = option;

    this.tweens.add({
      targets: this.visitorDetailsContainer,
      x: { from: 0, to: -500 },
      duration: 300,
      ease: Phaser.Math.Easing.Quadratic.Out
    })
    this.tweens.add({
      targets: [...this.waiterTextboxes, this.waiterBox, this.waiterTitle],
      x: '+=500',
      duration: 300,
      ease: Phaser.Math.Easing.Quadratic.Out,
      onComplete: () => this.cleanUpList()
    })
  }

  cleanUpList(): void {
    this.isShowingList = false;
    for (const item of this.waiterTextboxes) {
      this.children.remove(item);
    }

    for (const item of this.visitorTextboxes) {
      this.visitorDetailsContainer.remove(item, true);
    }

    this.waiterTextboxes = [];
    this.visitorTextboxes = [];
  }

}