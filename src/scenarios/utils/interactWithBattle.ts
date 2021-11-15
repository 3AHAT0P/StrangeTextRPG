import { AbstractActor } from '@actors';
import { Cursor } from '@db';
import { ActionModel } from '@db/entities';
import { Battle } from '@scenarios/utils/Battle';
import { AbstractUI } from '@ui/@types';

import { findActionBySubtype } from './findActionBySubtype';

export const interactWithBattle = async (
  ui: AbstractUI, cursor: Cursor,
  player: AbstractActor, enemies: AbstractActor[],
  forceReturnOnLeave: boolean = false,
): Promise<ActionModel | null> => {
  const battleInteraction = new Battle({ ui, player, enemies });

  const battleResult = await battleInteraction.activate();
  const actions = await cursor.getActions();

  if (battleResult === 'BATTLE_LEAVE' && forceReturnOnLeave) return null;

  const action = findActionBySubtype(actions, battleResult);
  if (action == null) throw new Error('Incorrect battle result');

  return action;
};
