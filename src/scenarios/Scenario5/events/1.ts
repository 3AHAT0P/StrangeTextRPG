import { KnifeWeapon } from '@actors/weapon';
import { AbstractEvent, EventState } from '@scenarios/utils/Event';

export type Event1State = EventState;

export const event1Id: `Scenario:${number | string}|Location:${number}|Event:${number}` = 'Scenario:10001|Location:1|Event:1';

export class Event1 extends AbstractEvent<Event1State> {
  protected _state: Event1State = 'INITIAL';

  public readonly id = event1Id;

  stateDidUpdated(state: Event1State): void {
    if (state === 'FINISHED') {
      this._player.equipWeapon(new KnifeWeapon());
    }
  }
}
