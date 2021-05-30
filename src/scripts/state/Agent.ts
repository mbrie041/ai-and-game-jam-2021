export { Agent, StateReport as AgentState, AgentStrategy, StateDetails };

type StateReport = {
  source: Agent,
  state: StateDetails
}

type StateDetails =
  { name: "ignore" } |
  { name: "dayOver" } |
  { name: "wantsAttention" } |
  { name: "gameTime", day: number, minute: number };


interface AgentStrategy {
  /** Informs the strategy of an event that occurred. */
  tell(report: StateReport): void;

  /** 
   * Act upon events received since the last tick. If the agent cannot act yet, this method will
   * return undefined. This will be used for interactive agents (ie. player, transition causing
   * agents).
   * */
  tick(): StateDetails | undefined;
}

/**
 * An agent is an object that plays a role in the game, including NPCs, the player, and the time 
 * updater. Most of an agent's behaviour is delegated to its strategy implementation.
 */
class Agent {
  readonly name: string;
  private readonly strategy: AgentStrategy;

  constructor(name: string, strategy: AgentStrategy) {
    this.name = name;
    this.strategy = strategy;
  }

  tell(state: StateReport): void {
    this.strategy.tell(state);
  }

  tick(): StateDetails | undefined {
    return this.strategy.tick();
  }
}
