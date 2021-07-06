/* eslint-disable max-classes-per-file */
import { AbstractItem, ItemRarity } from '@actors/AbstractItem';
import type { AbstractActor } from '@actors';

export abstract class Miscellaneous extends AbstractItem {
  // maybe one day Miscellaneous can be used...
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public use(player: AbstractActor) { return ''; }
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
