import { AbstractUI } from "../ui/AbstractUI";
import { AbstractActor, AttackResult } from "../actors/AbstractActor";
import { SimpleInteraction } from './SimpleInteraction';
import { Interaction } from "./Interaction";
import { AttackInteraction } from "./AttackInteraction";

export const initializeInteractions = (ui: AbstractUI) => {
  const mainInteraction = new SimpleInteraction(ui, { message: 'БЕРИ МЕЧ И РУБИ!\n' });
  const takeSwordInteraction = new SimpleInteraction(ui, { message: 'Ладонь сжимает рукоять меча - шершавую и тёплую.\n' });
  const attackInteraction = new SimpleInteraction(ui, { message: 'Воздух свистит, рассекаемый сталью, и расплывчатый силуэт перед тобой делает сальто назад.\n' });

  const lookAroundInteraction = new SimpleInteraction(ui, {
    message: 'Серый песок, фиолетовое небо, и расплывчатый клинок, торчащий из твоей грудины.\n'
      + 'Времени не было уже секунду назад; сейчас последние секунды с кровью утекают в песок.\n'
      + 'Вы проиграли\n',
  });

  const toBeContinuedInteraction = new SimpleInteraction(ui, { message: 'Продолжение следует...\n' });
  const exitInteraction = new Interaction(ui, {
    buildMessage() { return 'Удачи!\n'; },
    activate() {
      process.exit(0);
    }
  });

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
  
  return {
    mainInteraction,
    takeSwordInteraction,
    attackInteraction,
    lookAroundInteraction,
    toBeContinuedInteraction,
    exitInteraction,
  };
};



export const battleInteractionBuilder = (ui: AbstractUI, player: AbstractActor, ...enemies: AbstractActor[]) => {
  const mainInteraction = new SimpleInteraction(ui, {
    message: `Ты встретил ${enemies.length}х крыс. Крысы хотят кушать, а ты выглядишь очень аппетитно.\n`,
  });
  const playerAttackInteraction = new AttackInteraction(ui, { attacking: player, attacked: enemies[0] });
  const ratAttackInteraction = new AttackInteraction(ui, { attacking: enemies[0], attacked: player });

  const resultInteraction = new Interaction(ui, {
    buildMessage() {
      return `Результаты раунда:\n У тебя ${player.healthPoints} ОЗ;\n У крысы ${enemies[0].healthPoints} ОЗ;\nЧто будешь делать?\n`;
    },
  });

  mainInteraction.addAction('АТАКОВАТЬ\n', playerAttackInteraction);
  playerAttackInteraction.addAction('auto', ratAttackInteraction);
  ratAttackInteraction.addAction('auto', resultInteraction);
  resultInteraction.addAction('АТАКОВАТЬ\n', playerAttackInteraction);

  return { mainInteraction };
}
