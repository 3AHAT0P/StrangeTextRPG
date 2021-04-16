import { GameTreeNode } from "./GameTreeNode";

export const mainInteraction = new GameTreeNode('БЕРИ МЕЧ И РУБИ!\n');
export const takeSwordInteraction = new GameTreeNode('Ладонь сжимает рукоять меча - шершавую и тёплую.\n');
export const attackInteraction = new GameTreeNode('Воздух свистит, рассекаемый сталью, и расплывчатый силуэт перед тобой делает сальто назад.\n');

export const lookAroundInteraction = new GameTreeNode(
  'Серый песок, фиолетовое небо, и расплывчатый клинок, торчащий из твоей грудины.\n'
  + 'Времени не было уже секунду назад; сейчас последние секунды с кровью утекают в песок.\n'
  + 'Вы проиграли\n',
);

export const toBeContinuedInteraction = new GameTreeNode('Продолжение следует...\n');
export const exitInteraction = new GameTreeNode('Удачи!\n');

mainInteraction
  .addAction('ВЗЯТЬ МЕЧ\n', takeSwordInteraction)
  .addAction('ПОПЫТАТЬСЯ ОСМОТРЕТЬСЯ\n', lookAroundInteraction);

takeSwordInteraction
  .addAction('РУБИТЬ\n', attackInteraction)
  .addAction('ПОПЫТАТЬСЯ ОСМОТРЕТЬСЯ\n', lookAroundInteraction);

attackInteraction
  .addAction('Дальше?\n', toBeContinuedInteraction);

toBeContinuedInteraction
  .addAction('НАЧАТЬ ЗАНОВО\n', mainInteraction)
  .addAction('ВСЕ! ХВАТИТ С МЕНЯ!\n', exitInteraction);

lookAroundInteraction
  .addAction('НАЧАТЬ ЗАНОВО\n', mainInteraction)
  .addAction('ВСЕ! ХВАТИТ С МЕНЯ!\n', exitInteraction);
