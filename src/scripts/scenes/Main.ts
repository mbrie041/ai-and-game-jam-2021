import Time from "../agents/Time";
import { Agent } from "../state/Agent";
import Scenario from "../state/Scenario";
import Background from "./Background";

export default class Main extends Phaser.Scene {

  private scenario: Scenario;

  constructor() {
    super({ key: Main.name });
  }

  create(): void {
    const background = this.scene.add("background", Background, true) as Background;

    this.scenario = new Scenario([
      new Agent("background", background),
      new Agent("time-keeper", new Time())
    ]);
  }

  update(): void {
    this.scenario.update()
  }
}

