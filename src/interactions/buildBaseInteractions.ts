import { AbstractUI } from '@ui/AbstractUI';
import { SessionState } from '../SessionState';

import { SimpleInteraction } from './SimpleInteraction';
import { Interaction } from './Interaction';

export const buildBaseInteractions = (ui: AbstractUI, state: SessionState) => {
  const exitInteraction = new Interaction({
    ui,
    buildMessage() { return 'Удачи!\n'; },
    async activate() {
      await state.finishSession();
      return null;
    },
  });

  const toBeContinuedInteraction = new SimpleInteraction({ ui, message: 'Продолжение следует...\n' });

  const lastInteraction = new SimpleInteraction({ ui, message: 'Ну и что дальше?' });

  toBeContinuedInteraction.addAction('auto', lastInteraction);
  lastInteraction.addAction('ВСЕ! ХВАТИТ С МЕНЯ!', exitInteraction);

  return {
    toBeContinuedInteraction,
    lastInteraction,
    exitInteraction,
  };
};
