import { AbstractUI } from "../ui/AbstractUI";
import { SimpleInteraction } from './SimpleInteraction';
import { Interaction } from "./Interaction";
import { BattleInteraction } from "./BattleInteraction";
import { Rat } from "../actors/Rat";
import { Player } from "../actors/Player";
import { AbstractInteraction } from "./AbstractInteraction";
import { AbstractActor } from "../actors/AbstractActor";
import { SessionState } from "../SessionState";

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

export const buildFirstLocation = (ui: AbstractUI, state: SessionState, nextLocation?: AbstractInteraction): AbstractInteraction => {
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

  baseInteractions.lastInteraction.addAction('НАЧАТЬ ЗАНОВО', mainInteraction);

  if (nextLocation != null) baseInteractions.lastInteraction.addAction('Перейти к демо локации #2', nextLocation);

  return mainInteraction;
};

export const buildSecondLocation = (ui: AbstractUI, state: SessionState, nextLocation?: AbstractInteraction): AbstractInteraction => {
  const baseInteractions = getBaseInteractions(ui, state);

  const mainInteraction = new Interaction(ui, {
    buildMessage() { return ''; },
    async activate() {
      const player = new Player();
      const battleInteraction = new BattleInteraction(ui, { player, enemies: [new Rat(), new Rat()] });
      baseInteractions.lastInteraction.addAction('НАЧАТЬ ЗАНОВО', mainInteraction)
      if (nextLocation != null) baseInteractions.lastInteraction.addAction('Перейти к демо локации #3', nextLocation);
      battleInteraction.addAction('auto', baseInteractions.lastInteraction);
      return battleInteraction;
    },
  })

  return mainInteraction;
};
