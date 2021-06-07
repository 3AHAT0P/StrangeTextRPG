import { getRandomIntInclusive } from '@utils/getRandomIntInclusive';
import { returnByChance } from '@utils/returnByChance';
import { MESSAGES } from '@translations/ru';

export const itemRarity = <const>{
  COMMON: 1, RARE: 2, EPIC: 3, LEGENDARY: 4, DIVINE: 5,
};

export type ItemRarity = keyof typeof itemRarity;

export interface AbstractItemContructor<T extends AbstractItem> {
  rarityChance: Array<[ItemRarity, number]>;
  new(rarity: ItemRarity): T;
  create(this: AbstractItemContructor<T>, amount: [number, number]): T[];
}

export abstract class AbstractItem {
  public static rarityChance: Array<[ItemRarity, number]> = [
    ['DIVINE', 0.02],
    ['LEGENDARY', 0.08],
    ['EPIC', 0.2],
    ['RARE', 0.6],
    ['COMMON', 0.8],
  ];

  public static create<T extends AbstractItem>(
    this: AbstractItemContructor<T>, amount: [number, number] = [1, 1],
  ): T[] {
    const result = [];
    for (let i = 0; i < getRandomIntInclusive(...amount); i += 1) {
      const [rarity] = returnByChance<ItemRarity>(this.rarityChance, true);
      result.push(new this(rarity));
    }
    return result;
  }

  protected abstract baseName: string;

  public readonly rarity: ItemRarity = 'COMMON';

  public get name(): string {
    if (this.rarity === 'COMMON') return this.baseName;

    return `${this.baseName} [${MESSAGES[this.rarity]}]`;
  }

  constructor(rarity: ItemRarity = 'COMMON') {
    this.rarity = rarity;
  }
}
