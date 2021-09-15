import { Template } from '@utils/Template';
import { AbstractEntity, AbstractModel } from './Abstract';

export interface InteractionEntity extends AbstractEntity {
  text: string;
  isStart?: boolean;
}

export class InteractionModel extends AbstractModel {
  public readonly text: Template;

  public readonly isStart: boolean = false;

  constructor(data: InteractionEntity) {
    super(data);
    this.text = new Template(data.text);
    this.isStart = data.isStart ?? false;
  }
}
