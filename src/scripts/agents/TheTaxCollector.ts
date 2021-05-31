import { Agent, AgentStrategy, StateDetails, StateReport } from "../state/Agent";
import * as BT from "../state/BehaviourTree";

export default class TaxCollector implements AgentStrategy {
  private dayStarted = false;
  private talked = 0;

  private waitingInitial: StateDetails[] =
    [{ name: "waiting", appearance: "A well dressed man taps his foot impatiently.", actions: [] }];

  private behaviour = BT.waitFor(
    () => this.dayStarted,
    BT.inParallelUntilAny(
      BT.loop(() => BT.tell(this.waitingInitial))
    ));


  tell(report: StateReport): void {
    switch (report.state.name) {
      case "dayStart":
        this.dayStarted = true;
        break;
    }
  }

  tick(thisAgent: Agent): StateDetails[] | undefined {
    const currentActions = this.behaviour.next();

    return currentActions.done
      ? currentActions.value[1]
      : currentActions.value
  }

}