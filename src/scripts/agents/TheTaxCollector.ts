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

//dialog
// Initial state
// - Outraged that you would delay him 

// Initial talk response
// - What seems to be the problem fellow officer of the law?

// Character first talk option
// Good day citizen. There have been reports of unusual individuals trying to sneak contraband into town. As the good prince John's birthday ceremony is in 3 days, we're being diligent to make sure no one is breaking any rules. Have you seen anything strange or noticed anything you'd like to report? 

// 1st talk response
// No sir. Nothing out of the ordinary. 

// Character Second talk option
// Well citizen, what brings you to town today? 

// 2nd talk response
// I'm a collector for the NTA (Nottingham Tax Association). I collect all of the good Prince Johns taxes and have been asked to delivery them to him before his birthday. 

// Character third talk option
// Hmmm the NTA eh? Do you have any kind of documentation or way to prove this?  

// Second state
// - visibly annoyed

// 3rd talk option
// - (While bellowing) Sir! You are costing the region valuable dollars by delaying him. If you continue, I demand recompense equal to my hourly wages. *Andrew flashes a sack full of coins* Here is my identification! Now may I please pass?!

// Character fourth talk option
// Any lawbreaker can have a sack of coins. Where is your identification. Don't make me ask again.

// 2nd talk option
// - I demands to speak to your superior! *While yelling, your superior comes over and confirms that Andrew is in fact a tax collector. He tells you not to waste anymore time and to let Andrew pass.*

// Run out of time
// - If Andrew is still present when time ends, you get reamed out by the sheriff

// Arrest option
// - Andrew belows that this is ridiculous and demands to speak to your superior. While arresting Andrew, your superior comes over and confirms that Andrew is in fact a tax collector. He scolds you and reminds you not to arrest the innocent. He lets Andrew pass.

// Let pass option
// - Andrew thanks you politely and saunters through. 
