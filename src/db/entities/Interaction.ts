import { Template } from '@utils/Template';
import { AbstractEntity, AbstractModel } from './Abstract';

export interface InteractionEntity extends AbstractEntity {
  text: string;
}

export class InteractionModel extends AbstractModel {
  public readonly text: Template;

  constructor(data: InteractionEntity) {
    super(data);
    this.text = new Template(data.text);
  }
}
