import { AbstractQuest, QuestState } from '@scenarios/utils/Quest';

export type Quest1State = QuestState | 'PHASE_1' | 'PHASE_2';

export const quest1Id: `Scenario:${number | string}|Location:${number}|Quest:${number}` = 'Scenario:10001|Location:1|Quest:1';

export class Quest1 extends AbstractQuest<Quest1State> {
  protected _state: Quest1State = 'INITIAL';

  public readonly id = quest1Id;

  public readonly name = 'Погрызен, но не съеден!';

  stateDidUpdated(state: Quest1State): void {
    if (state === 'FINISHED_GOOD') {
      const [healingPotion] = this._player.inventory.getItemsByClassName('POTION', 'SmallHealingPotion');
      if (healingPotion == null) throw new Error('healing potion is null');
      this._player.inventory.dropItem(healingPotion);

      const [ring] = this._npcMap.main.inventory.getItemsByClassName('ARMOR', 'UniqueOldFamilyRingArmor');
      if (ring == null) throw new Error('ring is null');

      this._npcMap.main.inventory.collectItem(healingPotion);
      this._player.inventory.collectItem(ring);
    }
  }
}
