/* eslint-disable max-classes-per-file */
import { AbstractItem, ItemRarity } from '@actors/AbstractItem';
import { returnByChance } from '@utils/returnByChance';
import { MESSAGES } from '../../translations/ru';

export abstract class Miscellanious extends AbstractItem {
  abstract amount: number;

  // private static rarityChance: [ItemRarity, number][];

  static create(amount: number = 1): RatSkin | RatTail | StrangeFlute {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const rarity = returnByChance<ItemRarity>(this.rarityChance);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return new this(rarity, amount) as RatSkin | RatTail | StrangeFlute;
  }
}

export class RatSkin extends Miscellanious {
  readonly rarity: ItemRarity;

  readonly name: string;

  static rarityChance: [ItemRarity, number][] = [
    ['COMMON', 0.8],
    ['RARE', 0.6],
    ['EPIC', 0.2],
    ['LEGENDARY', 0.08],
    ['DIVINE', 0.02],
  ];

  amount = 0;

  constructor(rarity: ItemRarity = 'COMMON', amount: number) {
    super();
    this.rarity = rarity;
    this.amount = amount;
    this.name = `крысья шкура[${MESSAGES[rarity]}]`;
  }
}

export class RatTail extends Miscellanious {
  readonly rarity: ItemRarity;

  readonly name: string;

  amount = 0;

  static rarityChance: [ItemRarity, number][] = [
    ['COMMON', 0.8],
    ['RARE', 0.6],
    ['EPIC', 0.2],
    ['LEGENDARY', 0.08],
    ['DIVINE', 0.02],
  ];

  constructor(rarity: ItemRarity = 'COMMON', amount: number) {
    super();
    this.rarity = rarity;
    this.amount = amount;
    this.name = `крысиный хвост[${MESSAGES[rarity]}]`;
  }
}

export class StrangeFlute extends Miscellanious {
  readonly rarity: ItemRarity = 'DIVINE';

  readonly name = 'странная погрызенная флейта';

  amount = 0;

  static rarityChance: [ItemRarity, number][] = [
    ['DIVINE', 1],
  ];

  constructor(_: unknown, amount: number) {
    super();
    this.amount = amount;
  }
}
