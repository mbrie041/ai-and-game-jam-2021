import Images from "../Images";
import { Agent, StateDetails, StateReport, waiting } from "../state/Agent";
import * as BT from "../state/BehaviourTree";

export default class TaxCollector implements Agent {
  icon = Images.Characters.TaxCollector.key;
  name = "Andrew, the Tax Collector";

  private dayStarted = false;
  private actions: { [id: string]: boolean } = {};
  private frustration = 0;

  private waitingInitial = [waiting("A well dressed man glowers with his arms crossed.")];
  private waitingAnnoyed = [waiting("A well dressed man taps his foot impatiently.")];

  respondToFirstChat(): StateDetails[] {
    return [{
      name: "dialog",
      action: "You greet the man, \"Morning sir, what brings you to Nottingham?\"",
      message: this.frustration < 1
        ? "I'm a tax collector for the NTA, here to collect taxes for the Good Prince John. What's the hold up?"
        : "I'm here about the king's business and you are wasting my time!"
    }]
  }

  respondToSecondChat(): StateDetails[] {
    return [{
      name: "dialog",
      action: "You explain, \"the sheriff is concerned about outlaws, so everyone is getting checked at the gates until the festival is over.\"",
      message: "And as she could tell you, I am no outlaw, but you are wasting my time!"
    }]
  }

  respondToThirdChat(): StateDetails[] {
    return [{
      name: "dialog",
      action: "\"…\"",
      message: "No, I'm done speaking with you, let me pass!"
    }]
  }

  arrestResponse(): StateDetails[] {
    return [{
      name: "dialog",
      action: "You take out your manacles, \"sir, you are under arrest.\" He rants angrily as you lead him away.",
      message: "WHAT? This is ridiculous! I demand to speak to the sheriff!"
    }]
  }

  passResponse(): StateDetails[] {
    return [{
      name: "dialog",
      action: "You wave the Tax Collector through, \"Enjoy your stay in Nottingham\" He nods as he passes.",
      message: "Thank you. I will."
    }]
  }
  searchResponse(): StateDetails[] {
    return [{
      name: "dialog",
      action: "You search the Tax Collector, \"Search text\" He opens his bags.",
      message: "This is the tax collectors response."
    }]
  }
  repeatSearchResponse(): StateDetails[] {
    return [{
      name: "dialog",
      action: "You try to search the Tax Collector again, \"Search text\" He opens his bags.",
      message: "You've already searched me. Stop wasting my team."
    }]
  }

  private behaviour = BT.waitFor(
    () => this.dayStarted,
    BT.selector(
      BT.inParallelUntilAny(
        BT.waitFor(
          () => this.actions["Arrest"],
          BT.tell(this.arrestResponse())
        ),
        BT.sequence(
          BT.waitFor(
            () => this.actions["Chat"],
            BT.tell(() => this.respondToFirstChat())),
          BT.waitFor(
            () => this.actions["Chat"],
            BT.tell(() => this.respondToSecondChat())),
          BT.loop(() => BT.waitFor(
            () => this.actions["Chat"],
            BT.tell(() => this.respondToThirdChat())))),
        //I need to write the sequence here for let pass
        BT.waitFor(
          () => this.actions["Let Pass"],
          BT.tell(this.passResponse())
        ),
        //I need to write the sequence here for search
        BT.sequence(
          BT.waitFor(
            () => this.actions["Search"],
            BT.tell(this.searchResponse())),
          BT.loop(() =>  BT.waitFor(
            () => this.actions["Search"],
            BT.tell(this.repeatSearchResponse()))),
        ),
        BT.sequence(
          BT.until(
            () => this.frustration > 0,
            () => BT.tell(this.waitingInitial)),
          BT.loop(() => BT.tell(this.waitingAnnoyed))),

      )));


  tell(report: StateReport): void {
    switch (report.state.name) {
      case "dayOver":
        this.dayStarted = false;
        break;
      case "gameTime":
        this.dayStarted = true;
        if (report.state.minute > 5) {
          this.frustration |= 1;
        }
        break;
      case "contextlessAction":
        if (report.state.target == this) {
          this.actions[report.state.action] = true;
        }
        break;
    }
  }

  tick(): StateDetails[] | undefined {
    const currentActions = this.behaviour.next();

    this.actions = {};

    return !currentActions.done
      ? currentActions.value
      // if next is called multiple times after done, subsequent results are undefined.
      : Array.isArray(currentActions.value) ? currentActions.value[1] : []
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
