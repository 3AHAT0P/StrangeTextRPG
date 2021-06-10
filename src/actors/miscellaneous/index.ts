/* eslint-disable max-classes-per-file */
import { AbstractItem, ItemRarity } from '@actors/AbstractItem';

export abstract class Miscellaneous extends AbstractItem {

}

export class RatSkin extends Miscellaneous {
  protected readonly baseName: string = 'крысья шкура';
}

export class RatTail extends Miscellaneous {
  protected readonly baseName: string = 'крысиный хвост';
}

export class StrangeFlute extends Miscellaneous {
  public static rarityChance: [ItemRarity, number][] = [
    ['DIVINE', 1],
  ];

  protected readonly baseName = 'странная погрызенная флейта';

  constructor() {
    super('DIVINE');
  }
}
