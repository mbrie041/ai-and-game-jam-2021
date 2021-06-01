import Images from "../Images";
import { Agent, ContextlessOption, StateDetails, StateReport, Waiting } from "../state/Agent";
import { ClickCursor, FontDefaults, Interactive } from "../Styles";

const contextlessOptions: ContextlessOption[] = ["Chat", "Let Pass", "Search", "Arrest"];
export default class PlayerInterface extends Phaser.Scene implements Agent {
  icon = null;
  name = "player-ui";

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
      .image(0, 800, Images.Dialog.NarrowTall.key)
      .setOrigin(0, 0);
    this.waiterTitle = this.add
      .text(28, 24 + 800, "Waiting", { ...FontDefaults, fontStyle: 'bold' })
      .setOrigin(0, 0);

    this.visitorAvatar = this.add
      .image(0, 2, "")
      .setOrigin(0, 0);
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

    this.visitorDetailsContainer = this.add.container(0, -400);
    this.visitorDetailsContainer.add(this.add
      .image(0, 0, Images.Dialog.WideTall.key)
      .setOrigin(0, 0))
    this.visitorDetailsContainer.add(this.visitorAvatar);
    this.visitorDetailsContainer.add(this.visitorTitle);
    this.visitorDetailsContainer.add(this.visitorContent);
  }

  showList(): void {
    this.isShowingList = true;
    const x = 28;
    let y = 56 + 800;

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
      y: '-=368',
      duration: 300,
      ease: Phaser.Math.Easing.Back.Out
    })
  }

  clicked(item: Waiting & { agent: Agent; }): void {
    if (this.visitorDetailsContainer.y > 0) {
      this.tweens.add({
        targets: this.visitorDetailsContainer,
        y: { from: 0, to: -400 },
        duration: 200,
        ease: Phaser.Math.Easing.Back.In,
        onComplete: () => this.clicked(item)
      })
      return;
    }

    // Clean up any old text extra actions.
    for (const item of this.visitorTextboxes) {
      this.visitorDetailsContainer.remove(item, true);
    }

    // Set up the dialog.
    this.visitorAvatar
      .setTexture(item.agent.icon ?? "")
      .setVisible(item.agent.icon !== null)
      .setDisplaySize(60, 60);

    this.visitorTitle.setText(item.agent.name);
    this.visitorContent.setText(item.appearance);

    let x = 28;
    let y = 240;

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
      x += text.width + 24;
    }

    y = 280;
    x = 28;
    for (const option of contextlessOptions) {
      const text = this.add
        .text(x, y, option, {
          ...Interactive,
          fontSize: '24px',
          fontStyle: 'small-caps'
        })
        .setOrigin(0, 0)
        .setInteractive(ClickCursor)
        .on(Phaser.Input.Events.POINTER_DOWN, () => this.actionSelected({ name: "contextlessAction", target: item.agent, action: option }));
      this.visitorTextboxes.push(text);
      this.visitorDetailsContainer.add(text);
      x += text.width + 24;
    }

    this.tweens.add({
      targets: this.visitorDetailsContainer,
      y: { from: -400, to: 0 },
      duration: 300,
      ease: Phaser.Math.Easing.Back.Out
    })
  }

  actionSelected(option: StateDetails): void {
    this.nextAction = option;

    this.tweens.add({
      targets: this.visitorDetailsContainer,
      y: { from: 0, to: -400 },
      duration: 200,
      ease: Phaser.Math.Easing.Back.In
    })
    this.tweens.add({
      targets: [...this.waiterTextboxes, this.waiterBox, this.waiterTitle],
      y: '+=368',
      duration: 200,
      ease: Phaser.Math.Easing.Back.In,
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