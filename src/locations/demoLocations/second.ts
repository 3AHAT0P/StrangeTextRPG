import { Player } from '@actors/Player';
import { Rat } from '@actors/Rat';
import { AbstractInteraction } from '@interactions/AbstractInteraction';
import { BattleInteraction, BATTLE_FINAL_ACTIONS } from '@interactions/BattleInteraction';
import { Interaction } from '@interactions/Interaction';
import { buildBaseInteractions } from '@interactions/buildBaseInteractions';
import { AbstractUI } from '@ui/AbstractUI';
import { SessionState } from '../../SessionState';

import { LocationBuilder } from '../LocationBuilder';
import { NextLocation } from '../NextLocation';

export const buildSecondLocation: LocationBuilder = (
  ui: AbstractUI,
  state: SessionState,
  nextLocations: NextLocation[],
): AbstractInteraction => {
  const { lastInteraction } = buildBaseInteractions(ui, state);

  const mainInteraction = new Interaction({
    ui,
    buildMessage() { return ''; },
    async activate() {
      const player = new Player();
      const enemies = [new Rat({ typePostfix: '№1' }), new Rat({ typePostfix: '№2' })];
      const battleInteraction = new BattleInteraction({ ui, player, enemies });
      lastInteraction.addAction('Перезагрузить локацию', mainInteraction);

      for (const nextLocation of nextLocations) {
        lastInteraction.addAction(nextLocation.actionMessage, nextLocation.interaction);
      }

      battleInteraction.addAction(BATTLE_FINAL_ACTIONS.PLAYER_WIN, lastInteraction);
      battleInteraction.addAction(BATTLE_FINAL_ACTIONS.PLAYER_DIED, lastInteraction);
      return battleInteraction;
    },
  });

  return mainInteraction;
};
