import { SessionState } from '../../SessionState';
import { AbstractInteraction } from "../../interactions/AbstractInteraction";
import { SimpleInteraction } from "../../interactions/SimpleInteraction";
import { buildBaseInteractions } from "../../interactions/buildBaseInteractions";
import { AbstractUI } from "../../ui/AbstractUI";
import { NextLocation } from "../NextLocation";
import { LocationBuilder } from '../LocationBuilder';

export const buildFirstLocation: LocationBuilder = (
  ui: AbstractUI,
  state: SessionState,
  nextLocations: NextLocation[]
): AbstractInteraction => {
  const { lastInteraction, toBeContinuedInteraction } = buildBaseInteractions(ui, state);

  const mainInteraction = new SimpleInteraction({
    ui,
    message: 'БЕРИ МЕЧ И РУБИ!\n',
  });

  const takeSwordInteraction = new SimpleInteraction({
    ui,
    message: 'Ладонь сжимает рукоять меча - шершавую и тёплую.\n',
  });

  const attackInteraction = new SimpleInteraction({
    ui,
    message: 'Воздух свистит, рассекаемый сталью, и расплывчатый силуэт перед тобой делает сальто назад.\n',
  });

  const lookAroundInteraction = new SimpleInteraction({
    ui,
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
    .addAction('Дальше?', toBeContinuedInteraction);

  lookAroundInteraction.addAction('auto', lastInteraction);

  lastInteraction.addAction('Перезагрузить локацию', mainInteraction);

  for (const nextLocation of nextLocations) {
    lastInteraction.addAction(nextLocation.actionMessage, nextLocation.interaction);
  }

  return mainInteraction;
};
