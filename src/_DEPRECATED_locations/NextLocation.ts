import { AbstractInteraction } from '_DEPRECATED_interactions/AbstractInteraction';
import { ActionType } from '_DEPRECATED_interactions/ActionMap';

export interface NextLocation {
  actionMessage: string;
  actionType: ActionType;
  interaction: AbstractInteraction;
}

export {};
