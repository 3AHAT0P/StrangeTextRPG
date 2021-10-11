import { AbstractActorOptions } from '@actors/AbstractActor';
import { AbstractNPC } from '@actors/AbstractNPC';
import { UniqueOldFamilyRingArmor } from '@actors/armor';

export const npc2Id: `Scenario:${number | string}|Location:${number}|NPC:${number}` = 'Scenario:10001|Location:1|NPC:2';

export class NPC2 extends AbstractNPC {
  protected readonly type = 'NPC';

  protected readonly _id = npc2Id;

  protected readonly declensionOfNouns = <const>{
    nominative: 'Незнакомец',
    genitive: 'Незнакомца',
    dative: 'Незнакомцу',
    accusative: 'Незнакомца',
    ablative: 'Незнакомцом',
    prepositional: 'об Незнакомце',

    possessive: 'Незнакомца',
  };

  protected readonly _maxHealthPoints = 10;

  public readonly name = 'Незнакомец';

  constructor(options: AbstractActorOptions = {}) {
    super(options);
    this.inventory.collectGold(10);
    this.inventory.collectItem(new UniqueOldFamilyRingArmor());
  }
}
