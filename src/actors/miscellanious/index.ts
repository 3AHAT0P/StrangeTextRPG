/* eslint-disable max-classes-per-file */
import { AbstractItem, ItemRarity, ItemType } from '@actors/AbstractItem';
import { MESSAGES } from '../../translations/ru';

export abstract class Miscellanious extends AbstractItem {
  itemType: ItemType = 'MISCELLANEOUS';

  abstract amount: number;
}

export class RatSkin extends Miscellanious {
  readonly rarity: ItemRarity;

  readonly name: string;

  amount = 0;

  constructor(rarity: ItemRarity = 'COMMON') {
    super();
    this.rarity = rarity;
    this.name = `крысья шкура[${MESSAGES[rarity]}]`;
  }
}

export class RatTail extends Miscellanious {
  readonly rarity: ItemRarity;

  readonly name: string;

  amount = 0;

  constructor(rarity: ItemRarity = 'COMMON') {
    super();
    this.rarity = rarity;
    this.name = `крысиный хвост[${MESSAGES[rarity]}]`;
  }
}

export class StrangeFlute extends Miscellanious {
  readonly rarity: ItemRarity = 'DIVINE';

  readonly name = 'странная погрызенная флейта';

  amount = 0;
}
