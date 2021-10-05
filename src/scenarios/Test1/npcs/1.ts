import { AbstractActorOptions } from '@actors/AbstractActor';
import { AbstractItem } from '@actors/AbstractItem';
import { AbstractMerchant } from '@actors/AbstractMerchant';
import { SmallHealingPotion } from '@actors/potions';

export class Merchant1 extends AbstractMerchant {
  protected readonly _id = 'Scenario:test|Location:1|NPC:1';

  protected readonly declensionOfNouns = <const>{
    nominative: 'Олаф',
    genitive: 'Олафа',
    dative: 'Олафу',
    accusative: 'Олафа',
    ablative: 'Олафом',
    prepositional: 'об Олафе',

    possessive: 'Олафа',
  };

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
