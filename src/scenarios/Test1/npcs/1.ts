import { AbstractActorOptions } from '@actors/AbstractActor';
import { AbstractItem } from '@actors/AbstractItem';
import { AbstractMerchant } from '@actors/AbstractMerchant';
import { RatTail } from '@actors/miscellaneous';
import { Player } from '@actors/Player';
import { SmallHealingPotion } from '@actors/potions';

export const merchant1Id: `Scenario:${number | string}|Location:${number}|NPC:${number}` = 'Scenario:10001|Location:1|NPC:1';

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

  exchangeTailsToHealingPoition(player: Player): boolean {
    const [potion] = this.inventory.getItemsByClassName('POTION', 'SmallHealingPotion');
    if (potion == null) return false;

    const tails = player.inventory.getItemsByClassName('MISC', 'RatTail');
    if (tails.length < 5) return false;

    tails.forEach((tail) => {
      player.inventory.dropItem(tail);
      this.inventory.collectItem(tail);
    });
    this.inventory.dropItem(potion);
    player.inventory.collectItem(potion);

    return true;
  }
}
