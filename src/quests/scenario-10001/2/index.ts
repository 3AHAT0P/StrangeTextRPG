import { AbstractQuest } from '@quests/AbstractQuest';
import { npc2Info } from '@npcs/scenario-10001/2/info';

import {
  Quest1Phase1GiveItemClass, Quest1Phase1TakeItemClass,
  quest2Id, Quest2State,
} from './info';

export class Quest2 extends AbstractQuest<Quest2State> {
  protected _state: Quest2State = 'PRE_INITIAL';

  public readonly id = quest2Id;

  public readonly name = 'Погрызен, но не съеден!';

  stateDidUpdated(state: Quest2State): void {
    if (state === 'FINISHED_GOOD') {
      const [healingPotion] = this._player.inventory.getItemsByClassName('POTION', Quest1Phase1TakeItemClass.name);
      if (healingPotion == null) throw new Error('healing potion is null');
      this._player.inventory.dropItem(healingPotion);

      const npc = this._npcManager.get(npc2Info.id);
      const [ring] = npc.inventory.getItemsByClassName('ARMOR', Quest1Phase1GiveItemClass.name);
      if (ring == null) throw new Error('ring is null');

      npc.inventory.collectItem(healingPotion);
      this._player.inventory.collectItem(ring);
    }
  }
}
