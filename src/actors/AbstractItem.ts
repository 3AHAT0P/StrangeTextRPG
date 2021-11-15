import { v4 as uuidv4 } from 'uuid';

import { getRandomIntInclusive } from '@utils/getRandomIntInclusive';
import { Randomizer } from '@utils/Randomizer';
import { MESSAGES } from '@translations/ru';
import type { AbstractActor } from '@actors/AbstractActor';

export const itemRarity = <const>{
  COMMON: 1, RARE: 2, EPIC: 3, LEGENDARY: 4, DIVINE: 5,
};

export type ItemRarity = keyof typeof itemRarity;

export interface AbstractItemContructor<T extends AbstractItem> {
  rarityChance: Array<[ItemRarity, number]>;
  new(rarity: ItemRarity): T;
  create(this: AbstractItemContructor<T>, amount: [number, number]): T[];
}
// TODO add description
export abstract class AbstractItem {
  public static rarityChance: Array<[ItemRarity, number]> = [
    ['DIVINE', 0.02],
    ['LEGENDARY', 0.08],
    ['EPIC', 0.1],
    ['RARE', 0.2],
    ['COMMON', 0.6],
  ];

  public static create<T extends AbstractItem>(
    this: AbstractItemContructor<T>, amount: [number, number] = [1, 1],
  ): T[] {
    const result = [];
    for (let i = 0; i < getRandomIntInclusive(...amount); i += 1) {
      const rarity = Randomizer.returnOneFromList<ItemRarity>(this.rarityChance);
      result.push(new this(rarity));
    }
    return result;
  }

  private _id: string = uuidv4();

  protected abstract baseName: string;

  protected abstract basePrice: number;

  public readonly rarity: ItemRarity = 'COMMON';

  public get id(): string { return this._id; }

  public get name(): string {
    if (this.rarity === 'COMMON') return this.baseName;

    return `${this.baseName} [${MESSAGES.rarity.male[this.rarity]}]`;
  }

  public get price(): number {
    if (this.rarity === 'DIVINE') return this.basePrice * 10;
    if (this.rarity === 'LEGENDARY') return this.basePrice * 5;
    if (this.rarity === 'EPIC') return this.basePrice * 2;
    if (this.rarity === 'RARE') return this.basePrice * 1.5;
    return this.basePrice;
  }

  constructor(rarity: ItemRarity = 'COMMON') {
    this.rarity = rarity;
  }

  public abstract use(player: AbstractActor): string;
}
