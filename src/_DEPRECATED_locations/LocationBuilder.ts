import { AbstractInteraction } from '_DEPRECATED_interactions/AbstractInteraction';
import { AbstractUI } from '@ui/@types';
import { SessionState } from '../SessionState';

import { NextLocation } from './NextLocation';

export interface LocationBuilder {
  (ui: AbstractUI, state: SessionState, nextLocations: NextLocation[]): AbstractInteraction;
}

export { };
