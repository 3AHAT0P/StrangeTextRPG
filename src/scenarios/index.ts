import { AbstractUI } from "../ui/AbstractUI";
import { SimpleInteraction } from '../interactions/SimpleInteraction';
import { Interaction } from "../interactions/Interaction";
import { Player } from "../actors/Player";
import { AbstractInteraction } from "../interactions/AbstractInteraction";
import { SessionState } from "../SessionState";
import { NextLocation } from "../locations/NextLocation";
import { buildFirstLocation } from "../locations/demoLocations/first";
import { buildSecondLocation } from "../locations/demoLocations/second";
import { buildRuinLocation } from "../locations/ruin";
import { buildBaseInteractions } from "../interactions/buildBaseInteractions";
import { RUIN_LOCATION_ACTIONS } from "../locations/ruin/RuinLocation";

export const buildZeroLocation = (ui: AbstractUI, state: SessionState): AbstractInteraction => {
  const { exitInteraction } = buildBaseInteractions(ui, state);

  const introInteraction = new SimpleInteraction({
    ui,
    message: 'Добро пожаловать в эту странную текстовую РПГ (Демо версия).\n'
      + 'Что бы ты хотел попробовать?',
  });

  const resetInteraction = new Interaction({
    ui,
    buildMessage() { return 'Reloading...'; },
    async activate(message) {
      await ui.sendToUser(message, 'default');
      // TODO: Возможно нам тут нужно немного больше чем просто резетнуть игрока
      state.player = new Player();
      return introInteraction;
    }
  });
  
  const nextLocation: NextLocation = {
    actionMessage: 'Вернутся к выбору локаций',
    interaction: resetInteraction,
  };

  const firstLocation = buildFirstLocation(ui, state, [nextLocation]);
  const secondLocation = buildSecondLocation(ui, state, [nextLocation]);
  const thirdLocation = buildRuinLocation(ui, state, [nextLocation, {
    actionMessage: RUIN_LOCATION_ACTIONS.PLAYER_DIED,
    interaction: resetInteraction,
  }]);

  introInteraction
    .addAction('Попробовать простой сюжет', firstLocation)
    .addAction('Попробовать боевку', secondLocation)
    .addAction('Перейти к полноценной локации', thirdLocation)
    .addAction('Закончить игру', exitInteraction);

  return introInteraction;
}
