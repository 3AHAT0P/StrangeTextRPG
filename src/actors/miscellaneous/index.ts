/* eslint-disable max-classes-per-file */
import { AbstractItem, ItemRarity } from '@actors/AbstractItem';
import type { AbstractActor } from '@actors';

export abstract class Miscellaneous extends AbstractItem {
  // maybe one day Miscellaneous can be used...
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public use(player: AbstractActor) { return 'И как ты планируешь это применить?'; }
}

export class RatSkin extends Miscellaneous {
  protected readonly baseName: string = 'крысья шкура';

  protected readonly basePrice = 1;
}

export class RatTail extends Miscellaneous {
  protected readonly baseName: string = 'крысиный хвост';

  protected readonly basePrice = 1;
}

export class StrangeFlute extends Miscellaneous {
  public static rarityChance: [ItemRarity, number][] = [
    ['DIVINE', 1],
  ];

  protected readonly baseName = 'странная погрызенная флейта';

  protected readonly basePrice = 0;

  constructor() {
    super('DIVINE');
  }
}
