import { AbstractUI } from "../ui/AbstractUI";
import { SimpleInteraction } from './SimpleInteraction';
import { Interaction } from "./Interaction";
import { BattleInteraction } from "./BattleInteraction";
import { Rat } from "../actors/Rat";
import { Player } from "../actors/Player";
import { AbstractInteraction } from "./AbstractInteraction";
import { AbstractActor } from "../actors/AbstractActor";
import { SessionState } from "../SessionState";

export interface NextLocation {
  actionMessage: string;
  interaction: AbstractInteraction;
}

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
  const introInteraction = new SimpleInteraction(ui, {
    message: 'Добро пожаловать в эту странную текстовую РПГ (Демо версия).\n'
      + 'Что бы ты хотел попробовать?',
  });
  
  const nextLocation: NextLocation = {
    actionMessage: 'Вернутся к выбору локаций',
    interaction: introInteraction,
  };

  const firstLocation = buildFirstLocation(ui, state, nextLocation);
  const secondLocation = buildSecondLocation(ui, state, nextLocation);
  const thirdLocation = buildThirdLocation(ui, state, nextLocation);

  introInteraction
    .addAction('Попробовать простой сюжет', firstLocation)
    .addAction('Попробовать боевку', secondLocation)
    .addAction('Перейти к полноценной локации', thirdLocation);

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
      const battleInteraction = new BattleInteraction(ui, { player, enemies: [new Rat({ typePostfix: '№1' }), new Rat({ typePostfix: '№2' })] });
      baseInteractions.lastInteraction.addAction('Перезагрузить локацию', mainInteraction)
      if (nextLocation != null) baseInteractions.lastInteraction.addAction(nextLocation.actionMessage, nextLocation.interaction);
      battleInteraction.addAction('auto', baseInteractions.lastInteraction);
      return battleInteraction;
    },
  })

  return mainInteraction;
};

export const buildThirdLocation = (ui: AbstractUI, state: SessionState, nextLocation?: NextLocation): AbstractInteraction => {
  const baseInteractions = getBaseInteractions(ui, state);

  const introInteraction = new SimpleInteraction(ui, {
    message: `Привет ${state.additionalInfo.playerName}.\n`
      + `${state.player.getType({ declension: 'nominative', capitalised: true })} очнулся посреди каких-то руин.\n`
      + `${state.player.getType({ declension: 'nominative', capitalised: true })} не знаешь кто ты, что ты и что вообще произошло.\n`,
  });

  baseInteractions.lastInteraction.removeAction('ВСЕ! ХВАТИТ С МЕНЯ!');
  baseInteractions.lastInteraction.addAction('Закончить игру', baseInteractions.exitInteraction);
  if (nextLocation != null) baseInteractions.lastInteraction.addAction(nextLocation.actionMessage, nextLocation.interaction);

  const mainInteraction = new SimpleInteraction(ui, { message: `Что будешь делать?\n` });

  const overviewInteraction = new Interaction(ui, {
    buildMessage() {
      return `Сумрачно.` 
        + ` ${state.player.getType({ declension: 'nominative', capitalised: true })} сидишь опёршись на уцелевший угол стены.`
        + ` Над ${state.player.getType({ declension: 'ablative'})} есть небольшой кусок крыши. Рядом почти потухший костер.`
        + ` Поодаль везде грязь и лужи. Моросит мелкий дождик.\n`;
    },
    async activate() {
      mainInteraction.addAction('Посмотреть на себя в лужу', seeMyselfInteraction);
      return 'SUPER';
    }
  });

  const seeMyselfInteraction = new Interaction(ui, {
    buildMessage() {
      return `${state.player.getType({ declension: 'possessive', capitalised: true })} характеристики:\n`
        + `Очки здоровья - ${state.player.healthPoints} / ${state.player.maxHealthPoints}\n`
        + `Защита - ${state.player.armor}\n`
        + `Сила удара - ${state.player.attackDamage}\n`
        + `Шанс попасть ударом - ${state.player.accuracy}\n`
        + `Шанс попасть в уязвимое место - ${state.player.criticalChance}\n`
      ;
    },
  });

  const standUpInteraction = new SimpleInteraction(ui, { message: `Перед тобой три пути. Куда пойдешь?\n` });

  const goForwardInteraction = new Interaction(ui, {
    buildMessage() {
      return `Ты идешь вперед.`;
    },
    async activate() {
      if (Math.random() > 0.5) {
        const battleInteraction = new BattleInteraction(ui, { player: state.player, enemies: [new Rat({ typePostfix: '№1' }), new Rat({ typePostfix: '№2' })] });
        battleInteraction.addAction('onWin', standUpInteraction);
        battleInteraction.addAction('onDied', baseInteractions.lastInteraction);
        return battleInteraction;
      }
      return standUpInteraction;
    }
  });
  const goLeftInteraction = new Interaction(ui, {
    buildMessage() {
      return `Ты идешь влево.`;
    },
    async activate() {
      if (Math.random() > 0.2) {
        const battleInteraction = new BattleInteraction(ui, { player: state.player, enemies: [new Rat({ typePostfix: '№1' })] });
        battleInteraction.addAction('onWin', standUpInteraction);
        battleInteraction.addAction('onDied', baseInteractions.lastInteraction);
        return battleInteraction;
      }
      return standUpInteraction;
    }
  });
  const goRightInteraction = new Interaction(ui, {
    buildMessage() {
      return `Ты идешь вправо.`;
    },
    async activate() {
      if (Math.random() > 0.8) {
        const battleInteraction = new BattleInteraction(ui, { player: state.player, enemies: [new Rat({ typePostfix: '№1' }), new Rat({ typePostfix: '№2' }), new Rat({ typePostfix: '№3' })] });
        battleInteraction.addAction('onWin', standUpInteraction);
        battleInteraction.addAction('onDied', baseInteractions.lastInteraction);
        return battleInteraction;
      }
      return standUpInteraction;
    }
  });

  introInteraction.addAction('auto', mainInteraction);
  mainInteraction.addAction('Оглядется', overviewInteraction);
  mainInteraction.addAction('Встать', standUpInteraction);
  mainInteraction.addAction('Закончить игру', baseInteractions.exitInteraction);
  overviewInteraction.addAction('auto', mainInteraction);
  seeMyselfInteraction.addAction('auto', mainInteraction);

  standUpInteraction
    .addAction('Пойти налево', goLeftInteraction)
    .addAction('Пойти прямо', goForwardInteraction)
    .addAction('Пойти направо', goRightInteraction)
    .addAction('Закончить игру', baseInteractions.exitInteraction);

  return introInteraction;
};
