import { AbstractUI } from "./ui/AbstractUI";
import { SimpleInteraction } from './interactions/SimpleInteraction';
import { Interaction } from "./interactions/Interaction";
import { BattleInteraction } from "./interactions/BattleInteraction";
import { Rat } from "./actors/Rat";
import { Player } from "./actors/Player";
import { AbstractInteraction, Interactable } from "./interactions/AbstractInteraction";
import { AbstractActor } from "./actors/AbstractActor";
import { SessionState } from "./SessionState";
import { isPresent } from "./utils/check";
import { RuinLocation } from "./locations/ruin";
import { NextLocation } from "./locations/NextLocation";
import { Skeleton } from "./actors/Skeleton";

export const getBaseInteractions = (ui: AbstractUI, state: SessionState) => {
  const exitInteraction = new Interaction(ui, {
    buildMessage() { return 'Удачи!\n'; },
    async activate() {
      state.finishSession();
      return null;
    }
  });

  const toBeContinuedInteraction = new SimpleInteraction(ui, { message: 'Продолжение следует...\n' });

  const lastInteraction = new SimpleInteraction(ui, { message: 'Ну и что дальше?' });

  toBeContinuedInteraction.addAction('auto', lastInteraction);
  lastInteraction.addAction('ВСЕ! ХВАТИТ С МЕНЯ!', exitInteraction);

  return {
    toBeContinuedInteraction,
    lastInteraction,
    exitInteraction,
  };
}

export const buildZeroLocation = (ui: AbstractUI, state: SessionState): AbstractInteraction => {
  const baseInteractions = getBaseInteractions(ui, state);

  const introInteraction = new SimpleInteraction(ui, {
    message: 'Добро пожаловать в эту странную текстовую РПГ (Демо версия).\n'
      + 'Что бы ты хотел попробовать?',
  });
  
  const nextLocation: NextLocation = {
    actionMessage: 'Вернутся к выбору локаций',
    interaction: new Interaction(ui, {
      buildMessage() { return 'Reloading...'; },
      async activate() {
        state.player = new Player();
        return introInteraction;
      }
    }),
  };

  const firstLocation = buildFirstLocation(ui, state, nextLocation);
  const secondLocation = buildSecondLocation(ui, state, nextLocation);
  const thirdLocation = buildRuinLocation(ui, state, nextLocation);

  introInteraction
    .addAction('Попробовать простой сюжет', firstLocation)
    .addAction('Попробовать боевку', secondLocation)
    .addAction('Перейти к полноценной локации', thirdLocation)
    .addAction('Закончить игру', baseInteractions.exitInteraction);

  return introInteraction;
}

export const buildFirstLocation = (ui: AbstractUI, state: SessionState, nextLocation?: NextLocation): AbstractInteraction => {
  const baseInteractions = getBaseInteractions(ui, state);

  const mainInteraction = new SimpleInteraction(ui, { message: 'БЕРИ МЕЧ И РУБИ!\n' });
  const takeSwordInteraction = new SimpleInteraction(ui, { message: 'Ладонь сжимает рукоять меча - шершавую и тёплую.\n' });
  const attackInteraction = new SimpleInteraction(ui, { message: 'Воздух свистит, рассекаемый сталью, и расплывчатый силуэт перед тобой делает сальто назад.\n' });

  const lookAroundInteraction = new SimpleInteraction(ui, {
    message: 'Серый песок, фиолетовое небо, и расплывчатый клинок, торчащий из твоей грудины.\n'
      + 'Времени не было уже секунду назад; сейчас последние секунды с кровью утекают в песок.\n'
      + 'Вы проиграли\n',
  });

  mainInteraction
    .addAction('ВЗЯТЬ МЕЧ', takeSwordInteraction)
    .addAction('ПОПЫТАТЬСЯ ОСМОТРЕТЬСЯ', lookAroundInteraction);

  takeSwordInteraction
    .addAction('РУБИТЬ', attackInteraction)
    .addAction('ПОПЫТАТЬСЯ ОСМОТРЕТЬСЯ', lookAroundInteraction);

  attackInteraction
    .addAction('Дальше?', baseInteractions.toBeContinuedInteraction);

  lookAroundInteraction.addAction('auto', baseInteractions.lastInteraction);

  baseInteractions.lastInteraction.addAction('Перезагрузить локацию', mainInteraction);

  if (nextLocation != null) baseInteractions.lastInteraction.addAction(nextLocation.actionMessage, nextLocation.interaction);

  return mainInteraction;
};

export const buildSecondLocation = (ui: AbstractUI, state: SessionState, nextLocation?: NextLocation): AbstractInteraction => {
  const baseInteractions = getBaseInteractions(ui, state);

  const mainInteraction = new Interaction(ui, {
    buildMessage() { return ''; },
    async activate() {
      const player = new Player();
      // const battleInteraction = new BattleInteraction(ui, { player, enemies: [new Rat({ typePostfix: '№1' }), new Rat({ typePostfix: '№2' })] });
      const battleInteraction = new BattleInteraction(ui, { player, enemies: [new Skeleton({ typePostfix: '№1' }), new Skeleton({ typePostfix: '№2' }), new Skeleton({ typePostfix: '№3' }), new Skeleton({ typePostfix: '№4' }), new Skeleton({ typePostfix: '№5' })] });
      baseInteractions.lastInteraction.addAction('Перезагрузить локацию', mainInteraction);
      if (nextLocation != null) baseInteractions.lastInteraction.addAction(nextLocation.actionMessage, nextLocation.interaction);
      battleInteraction.addAction('auto', baseInteractions.lastInteraction);
      return battleInteraction;
    },
  })

  return mainInteraction;
};

export const buildRuinLocation = (ui: AbstractUI, state: SessionState, nextLocation?: NextLocation): Interactable => {
  return new RuinLocation({
    ui,
    state,
    nextLocation,
  });
};
