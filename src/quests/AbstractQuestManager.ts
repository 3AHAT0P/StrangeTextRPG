import { Player } from '@actors';
import { AbstractNPCManager } from '@npcs/AbstractNPCManager';

import { QuestId, QuestOptions, QuestState } from './@types';
import { AbstractQuest } from './AbstractQuest';

type AbstractQuestConstructor = new (options: QuestOptions) => AbstractQuest<any>;

export abstract class AbstractQuestManager {
  protected abstract _classMap: Readonly<Record<QuestId, AbstractQuestConstructor>>;

  private _questMap: Record<QuestId, AbstractQuest<any>> = {};

  protected _player: Player;

  protected _npcManager: AbstractNPCManager;

  constructor(options: QuestOptions) {
    this._player = options.player;
    this._npcManager = options.npcManager;
  }

  public get(questId: QuestId): AbstractQuest<QuestState> {
    let quest = this._questMap[questId];
    if (quest != null) return quest;

    const QuestClass = this._classMap[questId];
    if (QuestClass != null) {
      quest = new QuestClass({ player: this._player, npcManager: this._npcManager });
      this._questMap[questId] = quest;
      return quest;
    }

    throw new Error(`Quest with id (${questId}) not exists`);
  }
}
