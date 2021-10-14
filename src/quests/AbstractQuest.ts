import { AbstractNPCManager } from '@npcs/AbstractNPCManager';
import type { Player } from '@actors';

import { QuestId, QuestOptions } from './@types';

export abstract class AbstractQuest<TQuestState> {
  public abstract readonly id: QuestId;

  protected _player: Player;

  protected _npcManager: AbstractNPCManager;

  protected abstract _state: TQuestState;

  public get state(): TQuestState { return this._state; }

  public readonly abstract name: string;

  constructor(options: QuestOptions) {
    this._player = options.player;
    this._npcManager = options.npcManager;
  }

  public updateState(newState: TQuestState): void {
    this._state = newState;
    this.stateDidUpdated(this.state);
  }

  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
  public stateDidUpdated(state: TQuestState): void {
    /* noop */
  }
}
