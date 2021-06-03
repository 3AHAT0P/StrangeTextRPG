import { AbstractEntity, AbstractModel } from './Abstract';

export interface InteractionEntity extends AbstractEntity {
  interactionId: number;
  text: string;
}

export class InteractionModel extends AbstractModel implements InteractionEntity {
  public readonly interactionId: number;

  public readonly text: string;

  constructor(data: InteractionEntity) {
    super(data);
    this.interactionId = data.interactionId;
    this.text = data.text;
  }
}
