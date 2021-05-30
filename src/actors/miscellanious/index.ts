/* eslint-disable max-classes-per-file */
import { AbstractItem, ItemRarity } from '@actors/AbstractItem';
import { MESSAGES } from '@/translations/ru';

export abstract class Miscellanious extends AbstractItem {
  abstract amount: number;
}

export class RatSkin extends Miscellanious {
  readonly rarity: ItemRarity;

  readonly name: string;

  amount = 0;

  constructor(rarity: ItemRarity = 'COMMON') {
    super();
    this.rarity = rarity;
    this.name = `нож[${MESSAGES[rarity]}]`;
  }
}
