import { Player } from '@actors';
import { NPCManager } from '@scenarios/Test1/npcs';
import { AbstractQuest, QuestOptions, QuestState } from '@scenarios/utils/Quest';

import { Quest1, quest1Id } from './1';

export class QuestManager {
  private static _classMap = <const>{
    [quest1Id]: Quest1,
  };

  private _questMap: Record<string, AbstractQuest<any>> = {};

  protected _player: Player;

  protected _npcManager: NPCManager;

  constructor(options: QuestOptions) {
    this._player = options.player;
    this._npcManager = options.npcManager;
  }

  public get(questId: string): AbstractQuest<QuestState> {
    let quest = this._questMap[questId];
    if (quest != null) return quest;

    const QuestClass = QuestManager._classMap[questId];
    if (QuestClass != null) {
      quest = new QuestClass({ player: this._player, npcManager: this._npcManager });
      this._questMap[questId] = quest;
      return quest;
    }

    throw new Error(`Quest with id (${questId}) not exists`);
  }
}
