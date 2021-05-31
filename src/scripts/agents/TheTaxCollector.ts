import { Agent, AgentStrategy, StateDetails, StateReport } from "../state/Agent";

export default class TaxCollector implements AgentStrategy {
  tell(report: StateReport): void {

  }

  tick(thisAgent: Agent): StateDetails[] | undefined {
    return [{
      name: "waiting",
      appearance: "",
      actions: [{ name: "contextAction", target: thisAgent, label: "Test", action: "foo" }]
    }]
  }

}