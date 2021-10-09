import { ActionModel } from '@db/entities';
import { ActionSubtype } from '@db/entities/Action';

export const findActionBySubtype = (
  actions: ActionModel[], value: ActionSubtype,
): ActionModel | null => actions.find(({ subtype }) => subtype === value) ?? null;
