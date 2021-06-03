import Images from "../Images";
import { Agent, ContextlessOption, StateDetails, StateReport, Waiting } from "../state/Agent";
import { ClickCursor, FontDefaults, Interactive } from "../Styles";

const contextlessOptions: ContextlessOption[] = ["Chat", "Let Pass", "Search", "Arrest"];
export default class PlayerInterface extends Phaser.Scene implements Agent {
  icon = null;
  name = "player-ui";

  private waitPositions = [[1044, 446], [976, 234], [892, 480], [790, 268], [740, 430], [636, 264]]
  private sprites: { [id: string]: Phaser.GameObjects.Image } = {}

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
      if (!(report.source.name in this.sprites)) {
        const pos = this.waitPositions.pop();
        if (pos) {
          const newSprite = this.add
            .image(1300, 360, report.source.icon ?? "")
            .setDisplaySize(120, 120);
          this.tweens.add({
            targets: newSprite,
            x: { from: 1300, to: pos[0] },
            y: { from: 360, to: pos[1] },
            duration: 5000
          })
          this.tweens.add({
            targets: newSprite,
            angle: { from: 5, to: -5 },
            duration: 125,
            yoyo: true,
            loop: 18,
            onComplete: () => this.tweens.add({
              targets: newSprite,
              angle: { from: 5, to: 0 },
              duration: 62,
            })
          });
          this.sprites[report.source.name] = newSprite;
        } else {
          console.log("Could not show sprite, no positions left");
        }
      }
    }
  }

  tick(): StateDetails[] | undefined {
    for (const sprite in this.sprites) {
      if (this.currentlyWaiting.find(x => x.agent.name === sprite) === undefined) {
        if (!this.sprites[sprite].getData("done")) {
          this.sprites[sprite].setData("done", true);
          this.tweens.add({
            targets: this.sprites[sprite],
            alpha: { from: 1, to: 0 },
            ease: Phaser.Math.Easing.Expo.Out,
            duration: 500
          })
        } else {
          this.sprites[sprite].setVisible(true);
        }

      }
    }

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
        fontStyle: 'italic',
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