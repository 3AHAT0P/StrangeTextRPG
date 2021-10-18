import { KnifeWeapon } from '@weapon';
import { AbstractQuest } from '@quests/AbstractQuest';

import { quest1Id, Quest1State } from './info';

export class Quest1 extends AbstractQuest<Quest1State> {
  protected _state: Quest1State = 'PRE_INITIAL';

  public readonly id = quest1Id;

  public readonly name = 'О, кто-то ножик обронил';

  stateDidUpdated(state: Quest1State): void {
    if (state === 'FINISHED_GOOD') {
      this._player.equipWeapon(new KnifeWeapon());
    }
  }
}
