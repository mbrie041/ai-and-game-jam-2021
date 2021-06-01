import Sheriff from "../agents/TheSheriff";
import TaxCollector from "../agents/TheTaxCollector";
import Time from "../agents/Time";
import { Agent, StateDetails, StateReport } from "../state/Agent";
import Scenario from "../state/Scenario";
import Background from "./Background";
import Dialog from "./Dialog";
import PlayerInterface from "./PlayerInterface";
import TimeUi from "./TimeUi";

export default class Main extends Phaser.Scene implements Agent {

  private scenario: Scenario;
  private gameOver: boolean;

  constructor() {
    super({ key: Main.name });
  }
  icon: string | null;
  name: string;
  tell(report: StateReport): void {
    if (report.state.name === "gameOver") {
      this.gameOver = true;
    }
  }

  tick(): StateDetails[] | undefined {
    if (this.gameOver) {
      this.scene.stop();
      this.gameOver = false;
    }

    return [];
  }

  create(): void {
    this.input.setDefaultCursor('url(assets/images/cursor-neutral.png), pointer');
    const background = this.scene.add("background", Background, true) as Background;
    const timeUi = this.scene.add("time-ui", TimeUi, true) as TimeUi;
    const dialogUi = this.scene.add("dialog-ui", Dialog, true) as Dialog;
    const playerUi = this.scene.add("player-ui", PlayerInterface, true) as PlayerInterface;

    this.scenario = new Scenario([
      background,
      new Sheriff(),
      new TaxCollector(),
      dialogUi,
      new Time(),
      timeUi,
      playerUi,
      this
    ]);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scene.stop(background);
      this.scene.stop(timeUi);
      this.scene.stop(dialogUi);
      this.scene.stop(playerUi);
    })
  }

  update(): void {
    this.scenario.update()
  }
}

