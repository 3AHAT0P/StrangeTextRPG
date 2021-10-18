import { AbstractItem } from '@actors/AbstractItem';
import { SmallHealingPotion } from '@actors/potions';
import { AbstractActorOptions } from '@actors/AbstractActor';
import { Player } from '@actors/Player';
import { AbstractMerchant } from '@npcs/AbstractMerchant';

import { npc5Info, poitionExchangeCondition } from './info';

export class NPC5 extends AbstractMerchant {
  protected readonly _id = npc5Info.id;

  protected readonly declensionOfNouns = npc5Info.declensionOfNouns;

  protected readonly _maxHealthPoints = 100;

  public readonly name = npc5Info.name;

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

    const tails = player.inventory.getItemsByClassName(
      poitionExchangeCondition.itemType, poitionExchangeCondition.className,
    );
    if (tails.length < poitionExchangeCondition.count) return false;

    tails.forEach((tail) => {
      player.inventory.dropItem(tail);
      this.inventory.collectItem(tail);
    });
    this.inventory.dropItem(potion);
    player.inventory.collectItem(potion);

    return true;
  }
}
