import { Template } from '@utils/Template';
import { AbstractEntity, AbstractModel } from './Abstract';

export interface InteractionEntity extends AbstractEntity {
  interactionId: number;
  text: string;
}

export class InteractionModel extends AbstractModel {
  public readonly interactionId: number;

  public readonly text: Template;

  constructor(data: InteractionEntity) {
    super(data);
    this.interactionId = data.interactionId;
    this.text = new Template(data.text);
  }
}
