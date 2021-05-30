import { AgentState, AgentStrategy, StateDetails } from "../state/Agent";

export default class Time implements AgentStrategy {
  private day = 0;
  private minute = 0;
  private startedDay = false;

  tell(report: AgentState): void {
    // TODO advance time based on observed actions
  }
  tick(): StateDetails | undefined {
    if (!this.startedDay) {
      this.startedDay = true;
      return { name: "dayStart" }

    }
    this.minute++;
    if (this.minute == 120) {
      this.day++;
      this.minute = 0;
      this.startedDay = false;

      return { name: "dayOver" }
    }

    return { name: "gameTime", day: this.day, minute: this.minute };
  }

}