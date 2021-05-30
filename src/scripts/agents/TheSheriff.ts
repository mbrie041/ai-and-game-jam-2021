import { AgentStrategy, CharacterDialog, StateDetails, StateReport } from "../state/Agent";

export default class SheriffStrategy implements AgentStrategy {
  private messages: string[] = [];
  tell(report: StateReport): void {
    if (report.state.name === "dayStart") {
      if (report.state.day == 0) {
        this.messages.push("Get on duty!");
      }
    }
  }
  tick(): StateDetails[] | undefined {
    const dialogs = this.messages.map<CharacterDialog>(x => ({ name: "dialog", message: x }));
    this.messages = []
    return dialogs;
  }

}