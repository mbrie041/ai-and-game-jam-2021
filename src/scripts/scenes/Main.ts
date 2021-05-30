import Time from "../agents/Time";
import { Agent } from "../state/Agent";
import Scenario from "../state/Scenario";
import Background from "./Background";
import TimeUi from "./TimeUi";

export default class Main extends Phaser.Scene {

  private scenario: Scenario;

  constructor() {
    super({ key: Main.name });
  }

  create(): void {
    const background = this.scene.add("background", Background, true) as Background;
    const timeUi = this.scene.add("time-ui", TimeUi, true) as TimeUi;

    this.scenario = new Scenario([
      new Agent("time-keeper", new Time()),
      new Agent("background", background),
      new Agent("time-ui", timeUi)
    ]);
  }

  update(): void {
    this.scenario.update()
  }
}

