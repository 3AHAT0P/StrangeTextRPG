import { AbstractEntity, AbstractModel } from './Abstract';

export interface ActionEntity extends AbstractEntity {
  fromInteractionId: number;
  toInteractionId: number;
  text: string;
  type: 'SYSTEM' | 'AUTO' | 'CUSTOM';
}

export class ActionModel extends AbstractModel implements ActionEntity {
  public readonly fromInteractionId: number;

  public readonly toInteractionId: number;

  public readonly text: string;

  public readonly type: 'SYSTEM' | 'AUTO' | 'CUSTOM';

  constructor(data: ActionEntity) {
    super(data);
    this.fromInteractionId = data.fromInteractionId;
    this.toInteractionId = data.toInteractionId;
    this.text = data.text;
    this.type = data.type;
  }
}
