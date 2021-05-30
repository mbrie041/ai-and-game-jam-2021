import { AgentStrategy, StateDetails, StateReport } from "../state/Agent";

export default class Time implements AgentStrategy {
  private day = 0;
  private minute = -1;
  private startedDay = false;

  tell(report: StateReport): void {
    // TODO advance time based on observed actions
  }
  tick(): StateDetails[] | undefined {
    if (!this.startedDay) {
      this.startedDay = true;
      return [{ name: "dayStart", day: this.day }]

    }

    this.minute++;
    if (this.minute == 120) {
      this.day++;
      this.minute = -1;
      this.startedDay = false;

      return [{ name: "dayOver" }]
    }

    return [{ name: "gameTime", day: this.day, minute: this.minute }];
  }

}