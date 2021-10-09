import { AbstractActor } from '@actors';
import { Cursor } from '@db';
import { ActionModel } from '@db/entities';
import { Battle, BATTLE_FINAL_ACTIONS } from '@interactions/Battle';
import { AbstractUI } from '@ui';

import { findActionBySubtype } from './findActionBySubtype';

export const interactWithBattle = async (
  ui: AbstractUI, cursor: Cursor,
  player: AbstractActor, enemies: AbstractActor[],
  forceReturnOnLeave: boolean = false,
): Promise<ActionModel | null> => {
  const battleInteraction = new Battle({ ui, player, enemies });

  const battleResult = await battleInteraction.activate();
  const actions = await cursor.getActions();

  if (battleResult === BATTLE_FINAL_ACTIONS.PLAYER_WIN) {
    const winAction = findActionBySubtype(actions, 'BATTLE_WIN');
    if (winAction == null) throw new Error('winAction is null');
    return winAction;
  }

  if (battleResult === BATTLE_FINAL_ACTIONS.PLAYER_DIED) {
    const loseAction = findActionBySubtype(actions, 'BATTLE_LOSE');
    if (loseAction == null) throw new Error('loseAction is null');
    return loseAction;
  }

  if (battleResult === BATTLE_FINAL_ACTIONS.LEAVE) {
    if (forceReturnOnLeave) return null;

    const leaveAction = findActionBySubtype(actions, 'BATTLE_LEAVE');
    if (leaveAction == null) throw new Error('leaveAction is null');
    return leaveAction;
  }

  throw new Error('Incorrect battle result');
};
