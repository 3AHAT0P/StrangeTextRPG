import { ActionModel } from '@db/entities';
import { BaseScenarioContext } from '@scenarios/@types';

export interface ProcessedActions {
  auto: ActionModel | null;
  system: ActionModel[];
  custom: ActionModel[];
}

export const processActions = (actions: ActionModel[], context: BaseScenarioContext): ProcessedActions => {
  const result: ProcessedActions = {
    auto: null,
    system: [],
    custom: [],
  };
  for (const action of actions) {
    if (action.condition !== null) {
      action.condition.useContext(context);
      if (!action.condition.isEqualTo('true')) continue;
    }

    if (action.type === 'AUTO') {
      result.auto = action;
      return result;
    }

    if (action.type === 'SYSTEM') {
      result.system.push(action);
    } else {
      result.custom.push(action);
    }
  }

  return result;
};
