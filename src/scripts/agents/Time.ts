import { AgentState, AgentStrategy, StateDetails } from "../state/Agent";

export default class Time implements AgentStrategy {
  private day = 0;
  private minute = 0;

  tell(report: AgentState): void {
    // TODO advance time based on observed actions
  }
  tick(): StateDetails | undefined {
    this.minute++;
    if (this.minute == 120) {
      this.day++;
      this.minute = 0;
      return { name: "dayOver" }
    }

    return { name: "gameTime", day: this.day, minute: this.minute };
  }

}