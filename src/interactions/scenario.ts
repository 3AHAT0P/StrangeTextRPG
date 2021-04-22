import { AbstractUI } from "../ui/AbstractUI";
import { AbstractActor } from "../actors/AbstractActor";
import { SimpleInteraction } from './SimpleInteraction';
import { Interaction } from "./Interaction";
import { AttackInteraction } from "./AttackInteraction";
import { RoundResultInteraction } from "./RoundResultInteraction";
import { capitalise } from "../utils/capitalise";
import { AbstractInteraction } from "./AbstractInteraction";
import { Player } from "../actors/Player";

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
  let aliveEnemies = enemies;
  let aliveEnemiesNumber = aliveEnemies.length;

  const mainInteraction = new SimpleInteraction(ui, {
    message: `${capitalise(player.getTypeByDeclensionOfNoun('nominative'))} встретил ${enemies.length}х крыс. Крысы хотят кушать, а ты выглядишь очень аппетитно.\n`,
  });

  let resultInteraction = new RoundResultInteraction(ui, { actors: [player, ...aliveEnemies] });

  const playerDiedInteraction = new SimpleInteraction(ui, {
    message: `Умер. Совсем. Окончательно.\n`,
  });

  const exitBattleInteraction = new SimpleInteraction(ui, {
    message: `${capitalise(player.getTypeByDeclensionOfNoun('nominative'))} убил их всех, молодец.\n`,
  });

  let playerAttackInteractions: Array<[string, AbstractInteraction]> = aliveEnemies.map((enemy, index) => {
    const playerAttackInteraction = new AttackInteraction(ui, { attacking: player, attacked: enemy });
    const message = `АТАКОВАТЬ ${enemy.getTypeByDeclensionOfNoun('accusative')} №${index + 1}\n`;
    return [message, playerAttackInteraction];
  });

  playerAttackInteractions.forEach(([message, interaction]) => {
    mainInteraction.addAction(message, interaction);
    resultInteraction.addAction(message, interaction);
  });

  const endRoundInteraction = new Interaction(ui, {
    async activate(this: Interaction) {
      if (!player.isAlive) return [playerDiedInteraction];

      aliveEnemies = aliveEnemies.filter((enemy) => enemy.isAlive);
      if (aliveEnemies.length === 0) return [exitBattleInteraction];

      if (aliveEnemiesNumber != aliveEnemies.length) {
        playerAttackInteractions= aliveEnemies.map((enemy, index) => {
          const playerAttackInteraction = new AttackInteraction(ui, { attacking: player, attacked: enemy });
          const message = `АТАКОВАТЬ ${enemy.getTypeByDeclensionOfNoun('accusative')} №${index + 1}\n`;
          return [message, playerAttackInteraction];
        });

        resultInteraction = new RoundResultInteraction(ui, { actors: [player, ...aliveEnemies] });
        playerAttackInteractions.forEach(([message, interaction]) => resultInteraction.addAction(message, interaction));

        let lastEnemyAttackInteraction: AbstractInteraction | null = null;
        enemyAttackInteractions = aliveEnemies.map((enemy) => {
          const enemyAttackInteraction = new AttackInteraction(ui, { attacking: enemy, attacked: player, messageType: 'damageTaken' });
          if (lastEnemyAttackInteraction != null) lastEnemyAttackInteraction.addAction('auto', enemyAttackInteraction);
          lastEnemyAttackInteraction = enemyAttackInteraction;
          return enemyAttackInteraction;
        });

        playerAttackInteractions.forEach(([, interaction]) => interaction.addAction('auto', enemyAttackInteractions[0]));
        enemyAttackInteractions[enemyAttackInteractions.length - 1].addAction('auto', endRoundInteraction);

        aliveEnemiesNumber = aliveEnemies.length;
      }

      return [resultInteraction];
    },
  });

  let lastEnemyAttackInteraction: AbstractInteraction | null = null;
  let enemyAttackInteractions = aliveEnemies.map((enemy) => {
    const enemyAttackInteraction = new AttackInteraction(ui, { attacking: enemy, attacked: player, messageType: 'damageTaken' });
    if (lastEnemyAttackInteraction != null) lastEnemyAttackInteraction.addAction('auto', enemyAttackInteraction);
    lastEnemyAttackInteraction = enemyAttackInteraction;
    return enemyAttackInteraction;
  });

  playerAttackInteractions.forEach(([, interaction]) => interaction.addAction('auto', enemyAttackInteractions[0]));
  enemyAttackInteractions[enemyAttackInteractions.length - 1].addAction('auto', endRoundInteraction);

  return { mainInteraction };
}
