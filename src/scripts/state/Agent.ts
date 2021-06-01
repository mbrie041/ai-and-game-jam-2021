export {
  Agent,
  StateReport,
  StateDetails,
  GameTime,
  CharacterDialog,
  Waiting,
  ContextlessAction,
  ContextSpecificAction,
  ContextlessOption,
  waiting
};

type StateReport = {
  source: Agent,
  state: StateDetails
}

/** Game clock update. */
type GameTime = { name: "gameTime", day: number, minute: number }

/** An event to show a speech/action dialog. */
type CharacterDialog = { name: "dialog", message: string | null, action: string | null }

/** Actions that can always be applied to an NPC. */
type ContextlessAction = {
  name: "contextlessAction",
  target: Agent,
  action: ContextlessOption
}

type ContextlessOption = "Let Pass" | "Arrest" | "Chat" | "Search";


/** 
 * Some NPC agents may offer specific actions for the player to perform. This type is 
 * used to encode those actions. */
type ContextSpecificAction = {
  name: "contextAction",
  target: Agent,
  label: string,
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
  CharacterDialog |
  ContextlessAction |
  ContextSpecificAction;

function waiting(appearance: string, actions: ContextSpecificAction[] = []): StateDetails {
  return { name: "waiting", appearance, actions };
}

/**
 * An agent is an object that plays a role in the game, including NPCs, the player, and the time 
 * updater.
 */
interface Agent {
  readonly icon: string | null;
  readonly name: string;

  /** Informs the strategy of an event that occurred. */
  tell(state: StateReport): void;

  /** 
   * Act upon events received since the last tick. If the agent cannot act yet, this method will
   * return undefined. This will be used for interactive agents (ie. player, transition causing
   * agents).
   * */
  tick(): StateDetails[] | undefined;
}
