/* eslint-disable max-classes-per-file */
import { AbstractItem, ItemRarity } from '@actors/AbstractItem';

export abstract class Miscellanious extends AbstractItem {

}

export class RatSkin extends Miscellanious {
  protected readonly baseName: string = 'крысья шкура';
}

export class RatTail extends Miscellanious {
  protected readonly baseName: string = 'крысиный хвост';
}

export class StrangeFlute extends Miscellanious {
  public static rarityChance: [ItemRarity, number][] = [
    ['DIVINE', 1],
  ];

  protected readonly baseName = 'странная погрызенная флейта';

  constructor() {
    super('DIVINE');
  }
}
