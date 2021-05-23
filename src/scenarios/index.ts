import { AbstractUI } from '@ui/AbstractUI';
import {
  AbstractInteraction, SimpleInteraction, Interaction,
} from '@interactions';
import { Player } from '@actors/Player';
import { NextLocation } from '@locations/NextLocation';
import { buildFirstLocation } from '@locations/demoLocations/first';
import { buildSecondLocation } from '@locations/demoLocations/second';
import { buildRuinLocation } from '@locations/ruin';
import { RUIN_LOCATION_ACTIONS } from '@locations/ruin/RuinLocation';
import { ActionsLayout } from '@ui';
import { SessionState } from '../SessionState';

export const buildZeroLocation = (ui: AbstractUI, state: SessionState): AbstractInteraction => {
  const introInteraction = new SimpleInteraction({
    ui,
    actionsLayout: new ActionsLayout({ columns: 1 }),
    message: 'Добро пожаловать в эту странную текстовую РПГ (Демо версия).\n'
      + 'Что бы ты хотел попробовать?',
  });

  const demoInteraction = new SimpleInteraction({
    ui,
    message: 'Это режим в котором можно попробовать те или иные механики игры.\n'
      + 'Выбери что тебе интересно.',
  });

  const resetInteraction = new Interaction({
    ui,
    buildMessage() { return 'Reloading...'; },
    async activate(message) {
      await ui.sendToUser(message);
      // TODO: Возможно нам тут нужно немного больше чем просто резетнуть игрока
      // eslint-disable-next-line no-param-reassign
      state.player = new Player();
      return introInteraction;
    },
  });

  const nextLocation: NextLocation = {
    actionMessage: 'Вернутся к выбору локаций',
    actionType: 'CUSTOM',
    interaction: resetInteraction,
  };

  const firstLocation = buildFirstLocation(ui, state, [nextLocation]);
  const secondLocation = buildSecondLocation(ui, state, [nextLocation]);
  const thirdLocation = buildRuinLocation(ui, state, [nextLocation, {
    actionMessage: RUIN_LOCATION_ACTIONS.PLAYER_DIED,
    actionType: 'SYSTEM',
    interaction: resetInteraction,
  }]);

  demoInteraction
    .addAction('Попробовать сюжет', firstLocation)
    .addAction('Попробовать боевку', secondLocation)
    .addAction('Назад', introInteraction);

  introInteraction
    .addAction('Перейти к списку механик', demoInteraction)
    .addAction('Перейти к полноценной локации', thirdLocation);

  return introInteraction;
};
