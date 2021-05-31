import SheriffStrategy from "../agents/TheSheriff";
import TaxCollector from "../agents/TheTaxCollector";
import Time from "../agents/Time";
import Images from "../Images";
import { Agent } from "../state/Agent";
import Scenario from "../state/Scenario";
import Background from "./Background";
import Dialog from "./Dialog";
import PlayerInterface from "./PlayerInterface";
import TimeUi from "./TimeUi";

export default class Main extends Phaser.Scene {

  private scenario: Scenario;

  constructor() {
    super({ key: Main.name });
  }

  create(): void {
    this.input.setDefaultCursor('url(assets/images/cursor-neutral.png), pointer');
    const background = this.scene.add("background", Background, true) as Background;
    const timeUi = this.scene.add("time-ui", TimeUi, true) as TimeUi;
    const dialogUi = this.scene.add("dialog-ui", Dialog, true) as Dialog;
    const playerUi = this.scene.add("player-ui", PlayerInterface, true) as PlayerInterface;

    this.scenario = new Scenario([
      new Agent("time-keeper", new Time()),
      new Agent("background", background),
      new Agent("The Sheriff", new SheriffStrategy(), Images.Characters.Sheriff.key),
      new Agent("Andrew, the tax man", new TaxCollector()),
      new Agent("time-ui", timeUi),
      new Agent("dialog-ui", dialogUi),
      new Agent("player-ui", playerUi)
    ]);
  }

  update(): void {
    this.scenario.update()
  }
}

