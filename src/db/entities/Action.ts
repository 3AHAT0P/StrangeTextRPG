import { Template } from '@utils/Template';
import { AbstractEntity, AbstractModel } from './Abstract';

export interface ActionEntity extends AbstractEntity {
  fromInteractionId: number;
  toInteractionId: number;
  text: string;
  type: 'SYSTEM' | 'AUTO' | 'CUSTOM';
  condition?: string;
  isPrintable?: boolean;
}

export class ActionModel extends AbstractModel {
  public readonly fromInteractionId: number;

  public readonly toInteractionId: number;

  public readonly text: Template;

  public readonly type: 'SYSTEM' | 'AUTO' | 'CUSTOM';

  public readonly condition: Template | null;

  public readonly isPrintable: boolean;

  constructor(data: ActionEntity) {
    super(data);
    this.fromInteractionId = data.fromInteractionId;
    this.toInteractionId = data.toInteractionId;
    this.text = new Template(data.text);
    this.type = data.type;
    this.condition = data.condition == null ? null : new Template(data.condition);
    this.isPrintable = data.isPrintable ?? false;
  }
}
