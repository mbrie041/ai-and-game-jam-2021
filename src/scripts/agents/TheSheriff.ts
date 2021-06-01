import Images from "../Images";
import { Agent, CharacterDialog, StateDetails, StateReport } from "../state/Agent";

export default class Sheriff implements Agent {
  icon = Images.Characters.Sheriff.key;
  name = "The Sheriff";
  private messages: string[] = [];
  tell(report: StateReport): void {
    if (report.state.name === "dayStart") {
      if (report.state.day == 0) {
        this.messages.push("Get on duty!");
      }
    }
  }

  tick(): StateDetails[] | undefined {
    const dialogs = this.messages.map<CharacterDialog>(x => ({ name: "dialog", message: x, action: null }));
    this.messages = []
    return dialogs;
  }

}