import Images from "../Images";
import { Agent, StateDetails, StateReport, waiting } from "../state/Agent";
import * as BT from "../state/BehaviourTree";

export default class TaxCollector implements Agent {
  icon = Images.Characters.TaxCollector.key;
  name = "Andrew, the Tax Collector";

  private dayStarted = false;
  private talked = 0;
  private frustration = 0;

  private waitingInitial = [waiting("A well dressed man glowers with his arms crossed.")];
  private waitingAnnoyed = [waiting("A well dressed man taps his foot impatiently.")];

  private behaviour = BT.waitFor(
    () => this.dayStarted,
    BT.inParallelUntilAny(
      BT.sequence(
        BT.until(() => this.frustration > 0, () => BT.tell(this.waitingInitial)),
        BT.loop(() => BT.tell(this.waitingAnnoyed)))));


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
    }
  }

  tick(): StateDetails[] | undefined {
    const currentActions = this.behaviour.next();

    return currentActions.done
      ? currentActions.value[1]
      : currentActions.value
  }

}