import { Template } from '@utils/Template';
import { AbstractEntity, AbstractModel } from './Abstract';

export type ActionType = 'SYSTEM' | 'AUTO' | 'CUSTOM';
export type ActionSubtype = 'TALK_TO_NPC' | 'START_QUEST' | 'DEAL_SUCCESS' | 'DEAL_FAILURE'
| 'MOVE_TO_WEST' | 'MOVE_TO_EAST' | 'MOVE_TO_NORTH' | 'MOVE_TO_SOUTH' | 'MOVE_FORBIDDEN'
| 'EXIT_LOCATION' | 'OTHER' | 'BACK' | 'RELOAD'
| 'SHOW_HELP' | 'SHOW_MAP' | 'INVENTORY_OPEN' | 'INVENTORY_CLOSE' | 'TAKE_A_REST' | 'OPEN_MAIN_MENU'
| 'START_NEW_GAME' | 'DONATE_LINK' | 'MAIN_CONTACT' // handshacke
| 'BATTLE_START' | 'BATTLE_WIN' | 'BATTLE_LOSE' | 'BATTLE_LEAVE';

export interface ActionEntity extends AbstractEntity {
  toInteractionId: string;
  text: string;
  type: ActionType;
  subtype: ActionSubtype;
  condition?: string;
  operation?: string;
  isPrintable?: boolean;
}

export class ActionModel extends AbstractModel {
  public readonly toInteractionId: string;

  public readonly text: Template;

  public readonly type: ActionType;

  public readonly subtype: ActionSubtype;

  public readonly condition: Template | null;

  public readonly operation: Template | null;

  public readonly isPrintable: boolean;

  constructor(data: ActionEntity) {
    super(data);
    this.toInteractionId = data.toInteractionId;
    this.text = new Template(data.text);
    this.type = data.type;
    this.subtype = data.subtype;
    this.condition = data.condition == null ? null : new Template(data.condition);
    this.operation = data.operation == null ? null : new Template(data.operation);
    this.isPrintable = data.isPrintable ?? false;
  }
}
