import { AbstractEntity, AbstractModel } from './Abstract';

export type NPCSubtype = 'USUAL' | 'WITH_QUEST' | 'MERCHANT';

export interface NPCEntity extends AbstractEntity {
  NPCId: number;
  subtype: NPCSubtype;
}

export class NPCModel extends AbstractModel {
  public readonly NPCId: number;

  public readonly subtype: NPCSubtype;

  constructor(data: NPCEntity) {
    super(data);
    this.NPCId = data.NPCId;
    this.subtype = data.subtype;
  }
}
