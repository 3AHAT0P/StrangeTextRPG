import { Player } from '@actors';

export type EventState = 'INITIAL' | 'READY_TO_INTERACT' | 'FINISHED';

export interface EventOptions {
  player: Player;
}

export abstract class AbstractEvent<TEventState extends EventState> {
  public abstract readonly id: `Scenario:${number | string}|Location:${number}|Event:${number}`;

  protected abstract _state: TEventState;

  protected _player: Player;

  public get state(): TEventState { return this._state; }

  constructor(options: EventOptions) {
    this._player = options.player;
  }

  public updateState(newState: TEventState): void {
    this._state = newState;
    this.stateDidUpdated(this.state);
  }

  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
  public stateDidUpdated(state: TEventState): void {
    /* noop */
  }
}
