import { Agent } from "./Agent";

/**
 * Engine to drive the game scenario.
 */
export default class Scenario {
  private agents: Agent[];
  private nextToUpdate = 0;

  constructor(agents: Agent[]) {
    this.agents = agents;
  }

  /**
   * Run the update for a single agent.
   * @returns true, iff the current agent could be updated.
   */
  update(): boolean {
    const toUpdate = this.agents[this.nextToUpdate];
    const newStates = toUpdate.tick();
    if (newStates === undefined) {
      return false;
    }

    for (const newState of newStates) {
      for (const agent of this.agents) {
        agent.tell({ source: toUpdate, state: newState });
      }
    }

    // Move to next index to update.
    this.nextToUpdate = (this.nextToUpdate + 1) % this.agents.length;
    return true;
  }
}