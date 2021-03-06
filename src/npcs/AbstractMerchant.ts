import { AbstractItem } from '@actors/AbstractItem';

import { AbstractNPC } from './AbstractNPC';

export abstract class AbstractMerchant extends AbstractNPC {
  protected readonly type = 'Merchant';

  public readonly abstract showcase: AbstractItem[];
}
