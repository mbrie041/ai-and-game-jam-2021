import Images from "../Images";
import { Agent, StateDetails, StateReport, waiting } from "../state/Agent";
import * as BT from "../state/BehaviourTree";

export default class TaxCollector implements Agent {
  icon = Images.Characters.TaxCollector.key;
  name = "Andrew, the Tax Collector";

  private dayStarted = false;
  private actions: { [id: string]: boolean } = {};
  private frustration = 0;

  private waitingInitial = [waiting("A well dressed man glowers with his arms crossed.")];
  private waitingAnnoyed = [waiting("A well dressed man taps his foot impatiently.")];

  respondToFirstChat(): StateDetails[] {
    return [{
      name: "dialog",
      action: "You greet the man, \"Morning sir, what brings you to Nottingham?\"",
      message: this.frustration < 1
        ? "I'm a tax collector for the NTA, here to collect taxes for the Good Prince John. What's the hold up?"
        : "I'm here about the king's business and you are wasting my time!"
    }]
  }

  respondToSecondChat(): StateDetails[] {
    return [{
      name: "dialog",
      action: "You explain, \"the sheriff is concerned about outlaws, so everyone is getting checked at the gates until the festival is over.\"",
      message: "And as she could tell you, I am no outlaw, but you are wasting my time!"
    }]
  }

  respondToThirdChat(): StateDetails[] {
    return [{
      name: "dialog",
      action: "\"…\"",
      message: "No, I'm done speaking with you, let me pass!"
    }]
  }

  arrestResponse(): StateDetails[] {
    return [{
      name: "dialog",
      action: "You take out your manacles, \"sir, you are under arrest.\" He rants angrily as you lead him away.",
      message: "WHAT? This is ridiculous! I demand to speak to the sheriff!"
    }]
  }

  private behaviour = BT.waitFor(
    () => this.dayStarted,
    BT.selector(
      BT.inParallelUntilAny(
        BT.waitFor(
          () => this.actions["Arrest"],
          BT.tell(this.arrestResponse())
        ),
        BT.sequence(
          BT.waitFor(
            () => this.actions["Chat"],
            BT.tell(() => this.respondToFirstChat())),
          BT.waitFor(
            () => this.actions["Chat"],
            BT.tell(() => this.respondToSecondChat())),
          BT.loop(() => BT.waitFor(
            () => this.actions["Chat"],
            BT.tell(() => this.respondToThirdChat())))),
        BT.sequence(
          BT.until(
            () => this.frustration > 0,
            () => BT.tell(this.waitingInitial)),
          BT.loop(() => BT.tell(this.waitingAnnoyed))))

    ));


  tell(report: StateReport): void {
    switch (report.state.name) {
      case "dayOver":
        this.dayStarted = false;
        break;
      case "gameTime":
        this.dayStarted = true;
        if (report.state.minute > 5) {
          this.frustration |= 1;
        }
        break;
      case "contextlessAction":
        if (report.state.target == this) {
          this.actions[report.state.action] = true;
        }
        break;
    }
  }

  tick(): StateDetails[] | undefined {
    const currentActions = this.behaviour.next();

    this.actions = {};

    return !currentActions.done
      ? currentActions.value
      // if next is called multiple times after done, subsequent results are undefined.
      : Array.isArray(currentActions.value) ? currentActions.value[1] : []
  }

}