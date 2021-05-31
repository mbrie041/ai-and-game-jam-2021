import { AgentStrategy, StateDetails, StateReport } from "../state/Agent";

export default class TaxCollector implements AgentStrategy {
  tell(report: StateReport): void {

  }

  tick(): StateDetails[] | undefined {
    return [{ name: "waiting", appearance: "", actions: [] }]
  }

}