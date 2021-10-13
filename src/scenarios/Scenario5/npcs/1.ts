import { AbstractActorOptions } from '@actors/AbstractActor';
import { AbstractItem } from '@actors/AbstractItem';
import { AbstractMerchant } from '@npcs/AbstractMerchant';
import { SmallHealingPotion } from '@actors/potions';

export const merchant1Id: `Scenario:${number | string}|Location:${number}|NPC:${number}` = 'Scenario:5|Location:1|NPC:1';

export class Merchant1 extends AbstractMerchant {
  protected readonly _id = merchant1Id;

  protected readonly declensionOfNouns = <const>{
    nominative: 'Олаф',
    genitive: 'Олафа',
    dative: 'Олафу',
    accusative: 'Олафа',
    ablative: 'Олафом',
    prepositional: 'об Олафе',

    possessive: 'Олафа',
  };

  protected readonly _maxHealthPoints = 100;

  public readonly name = 'Олаф';

  public get showcase(): AbstractItem[] {
    return this.inventory.potions;
  }

  constructor(options: AbstractActorOptions = {}) {
    super(options);
    this.inventory.collectGold(200);
    for (let i = 0; i < 3; i += 1) {
      this.inventory.collectItem(new SmallHealingPotion());
    }
  }
}
