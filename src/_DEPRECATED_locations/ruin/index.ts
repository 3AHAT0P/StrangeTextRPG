import { AbstractInteraction } from '_DEPRECATED_interactions/AbstractInteraction';
import { AbstractUI } from '@ui/@types';
import { SessionState } from '../../SessionState';

import { LocationBuilder } from '../LocationBuilder';
import { NextLocation } from '../NextLocation';

import { RuinLocation } from './RuinLocation';

export const buildRuinLocation: LocationBuilder = (
  ui: AbstractUI,
  state: SessionState,
  nextLocations: NextLocation[],
): AbstractInteraction => {
  const ruin = new RuinLocation({ ui, state });

  for (const nextLocation of nextLocations) {
    if (nextLocation.actionType === 'SYSTEM') {
      ruin.addSystemAction(nextLocation.actionMessage, nextLocation.interaction);
    } else ruin.addAction(nextLocation.actionMessage, nextLocation.interaction);
  }

  return ruin;
};
