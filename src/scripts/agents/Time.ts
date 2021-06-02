import { Agent, StateDetails, StateReport } from "../state/Agent";

export default class Time implements Agent {
  icon = null;
  name = "time-tracker";
  private waitingCount = 0;
  private day = 0;
  private minute = 0;
  private startedDay = false;

  tell(report: StateReport): void {
    switch (report.state.name) {
      case "waiting":
        this.waitingCount++;
        break;
        
      case "contextlessAction":
        switch (report.state.action) {
          case "Arrest":
            this.minute += 10;
            break;
          case "Search":
            this.minute += 10;
            break;
          default: 
            this.minute += 1;
            break;
        }
    }
  }

  tick(): StateDetails[] | undefined {
    if (!this.startedDay) {
      this.startedDay = true;
      return [{ name: "dayStart", day: this.day }]

    }

    if (this.minute == 120 || this.minute > 0 && this.waitingCount == 0) {
      this.day++;
      this.minute = 0;
      this.startedDay = false;

      return [{ name: "dayOver" }]
    }

    this.waitingCount = 0;
    return [{ name: "gameTime", day: this.day, minute: this.minute }];
  }

}