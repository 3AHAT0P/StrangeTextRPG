import { AbstractInteraction } from '@interactions/AbstractInteraction';
import { AbstractUI } from '@ui/AbstractUI';
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

  for (const nextLocation of nextLocations) ruin.addAction(nextLocation.actionMessage, nextLocation.interaction);

  return ruin;
};
