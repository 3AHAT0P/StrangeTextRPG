import { AbstractInteraction } from '@interactions/AbstractInteraction';
import { ActionType } from '@interactions/ActionMap';

export interface NextLocation {
  actionMessage: string;
  actionType: ActionType;
  interaction: AbstractInteraction;
}

export {};
