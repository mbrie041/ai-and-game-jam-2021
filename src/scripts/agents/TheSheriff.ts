import Images from "../Images";
import { Agent, CharacterDialog, dialog, StateDetails, StateReport } from "../state/Agent";

export default class Sheriff implements Agent {
  icon = Images.Characters.Sheriff.key;
  name = "The Sheriff";
  private messages: StateDetails[] = [];
  private endOfDayMessages: StateDetails[] = [];
  private endOfDay = false;
  private evaluation = 0;

  tell(report: StateReport): void {
    switch (report.state.name) {
      case "dayStart":
        if (report.state.day == 0) {
          this.messages.push(dialog("Get on duty!"));
        }
        break;
      case "dayOver":
        this.endOfDay = true;
        break;
      case "contextlessAction":
        if (report.state.action === "Arrest" && report.state.target.icon === Images.Characters.TaxCollector.key) {
          this.evaluation -= 1;
          this.endOfDayMessages.push(
            dialog("Really? Arresting the king's servants? It will be your head on a platter if he hears of this."))
        }
        else if (report.state.action === "Arrest" && report.state.target.icon === Images.Characters.WineMaker.key) {
          this.evaluation += 1;
          this.endOfDayMessages.push(
            dialog("Good Work! You caught a scoundrel."))
        }
        break;
    }
  }

  tick(): StateDetails[] | undefined {
    let events = this.messages;
    this.messages = []

    if (this.endOfDay) {
      events = events.concat(this.endOfDayMessages);
      this.endOfDayMessages = [];
      if (this.evaluation < 0) {
        events.push(dialog("I can't trust you any more. Come with me, you're under arrest."))
        events.push({ name: "gameOver" });
      }
    }

    return events;
  }


}