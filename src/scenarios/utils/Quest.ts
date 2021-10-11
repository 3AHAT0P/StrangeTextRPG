import { NPCManager } from '@scenarios/Test1/npcs';
import type { Player } from '@actors';

export type QuestState = 'INITIAL' | 'FINISHED_GOOD' | 'FINISHED_BAD';

export interface QuestOptions {
  player: Player;
  npcManager: NPCManager;
}

export abstract class AbstractQuest<TQuestState> {
  public abstract readonly id: `Scenario:${number | string}|Location:${number}|Quest:${number}`;

  protected _player: Player;

  protected _npcManager: NPCManager;

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
