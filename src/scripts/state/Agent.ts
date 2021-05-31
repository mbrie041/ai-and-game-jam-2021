export {
  Agent,
  StateReport,
  AgentStrategy,
  StateDetails,
  GameTime,
  CharacterDialog,
  Waiting,
  ContextSpecificAction
};

type StateReport = {
  source: Agent,
  state: StateDetails
}

/** Game clock update. */
type GameTime = { name: "gameTime", day: number, minute: number }

/** An event to show a speech/action dialog. */
type CharacterDialog = { name: "dialog", message: string | null, action: string | null }

/** 
 * Some NPC agents may offer specific actions for the player to perform. This type is 
 * used to encode those actions. */
type ContextSpecificAction = {
  name: "contextAction",
  target: Agent,
  action: string
}

/** Message to indicate an NPC is waiting  */
type Waiting = {
  name: "waiting",

  /** A brief description of how the player perceives the NPC right now */
  appearance: string

  /** a list of 0 or more context specific actions, in addition to standard actions. */
  actions: ContextSpecificAction[]
}

type StateDetails =
  { name: "dayOver" } |
  { name: "dayStart", day: number } |
  Waiting |
  GameTime |
  CharacterDialog;


interface AgentStrategy {
  /** Informs the strategy of an event that occurred. */
  tell(report: StateReport): void;

  /** 
   * Act upon events received since the last tick. If the agent cannot act yet, this method will
   * return undefined. This will be used for interactive agents (ie. player, transition causing
   * agents).
   * */
  tick(): StateDetails[] | undefined;
}

/**
 * An agent is an object that plays a role in the game, including NPCs, the player, and the time 
 * updater. Most of an agent's behaviour is delegated to its strategy implementation.
 */
class Agent {
  readonly icon: string | null;
  readonly name: string;
  private readonly strategy: AgentStrategy;

  constructor(name: string, strategy: AgentStrategy, icon?: string) {
    this.name = name;
    this.icon = icon ?? null;
    this.strategy = strategy;
  }

  tell(state: StateReport): void {
    this.strategy.tell(state);
  }

  tick(): StateDetails[] | undefined {
    return this.strategy.tick();
  }
}
