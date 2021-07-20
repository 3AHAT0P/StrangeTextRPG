import { KnifeWeapon } from '@actors/weapon';
import type { ScenarioEvent } from '@utils/@types/ScenarioEvent';

import type { ScenarioContext } from '../@types';

export const eventId = 1;

export const eventStates = <const>{
  INITIAL: 0,
  READY_TO_INTERACT: 1,
  FINISHED: 2,
};

export type EventState = typeof eventStates[keyof typeof eventStates];

export const buildScenarioEvent = (ctx: ScenarioContext): ScenarioEvent<EventState> => {
  const event = {
    state: 0 as EventState,
    updateState(newState: EventState): void {
      this.state = newState;
      this.stateDidUpdated(this.state);
    },
    stateDidUpdated(state: EventState): void {
      if (state === eventStates.FINISHED) {
        // @TODO: update after merge inventory changes
        ctx.player.equipWeapon(new KnifeWeapon());
      }
    },
  };

  return event;
};
