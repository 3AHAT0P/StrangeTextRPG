import { Player } from '@actors';
import { AbstractEvent, EventOptions, EventState } from '@scenarios/utils/Event';

import { Event1, event1Id } from './1';

export class EventManager {
  private static _classMap = <const>{
    [event1Id]: Event1,
  };

  private _eventMap: Record<string, AbstractEvent<EventState>> = {};

  protected _player: Player;

  constructor(options: EventOptions) {
    this._player = options.player;
  }

  public get(eventId: string): AbstractEvent<EventState> {
    let event = this._eventMap[eventId];
    if (event != null) return event;

    const EventClass = EventManager._classMap[eventId];
    if (EventClass != null) {
      event = new EventClass({ player: this._player });
      this._eventMap[eventId] = event;
      return event;
    }

    throw new Error(`Event with id (${eventId}) not exists`);
  }
}
