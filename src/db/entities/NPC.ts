import type { NPCSubtype } from '@npcs/@types';

import { AbstractEntity, AbstractModel } from './Abstract';

export interface NPCEntity extends AbstractEntity {
  NPCId: string;
  subtype: NPCSubtype;
}

export class NPCModel extends AbstractModel {
  public readonly NPCId: string;

  public readonly subtype: NPCSubtype;

  constructor(data: NPCEntity) {
    super(data);
    this.NPCId = data.NPCId;
    this.subtype = data.subtype;
  }
}
