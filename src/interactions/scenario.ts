import { AbstractUI } from "../ui/AbstractUI";
import { SimpleInteraction } from './SimpleInteraction';
import { Interaction } from "./Interaction";
import { BattleInteraction } from "./BattleInteraction";
import { Rat } from "../actors/Rat";
import { Player } from "../actors/Player";
import { AbstractInteraction } from "./AbstractInteraction";
import { AbstractActor } from "../actors/AbstractActor";
import { SessionState } from "../SessionState";
import { isPresent } from "../utils/check";

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
      baseInteractions.lastInteraction.addAction('Перезагрузить локацию', mainInteraction);
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
      const stats = state.player.stats;
      return `${state.player.getType({ declension: 'possessive', capitalised: true })} характеристики:\n`
        + `Очки здоровья - ${stats.healthPoints} / ${stats.maxHealthPoints}\n`
        + `Защита - ${stats.armor}\n`
        + `Сила удара - ${stats.attackDamage}\n`
        + `Шанс попасть ударом - ${stats.accuracy}\n`
        + `Шанс попасть в уязвимое место - ${stats.criticalChance}\n`
        + `В кармане звенят ${state.player.gold} золота\n`
      ;
    },
  });

  /*
    - - недостижимое место
    w - wall, стена, нет прохода
    b - break, обрыв, нет прохода
    0, 1, 2, ... - количество монстров на локации
    m - merchant, торговец
    p - player, игрок
    o - out, выход
    g - gold, немного золота (1-5)
    G - GOLD, много золота (10-20)
        N
    W - X - E
        S
    - - w w w w b b b b b b b - - - - -
    w w w 1 2 w 2 0 0 1 0 g w - - - - -
    w 0 w 0 1 w 1 0 1 0 w G w - - - - -
    w 0 0 0 w w 0 1 0 0 w 3 w - - - - -
    w p 0 0 1 0 1 w 1 0 w m w - - - - -
    w w w w 1 w w w 0 1 w w w w w w w w
    - - w 0 1 0 0 0 0 0 0 m 0 0 0 0 3 o
    - b b b b b b b w w w w w w w w w w
    - b - - - - - b - - - - - - - - - -
    - b b b b b b b - - - - - - - - - -
    - - - - - - - - - - - - - - - - - -
  */

  const map = [
    '-', '-', 'w', 'w', 'w', 'w', 'b', 'b', 'b', 'b', 'b', 'b', 'b', '-', '-', '-', '-', '-',
    'w', 'w', 'w', '1', '2', 'w', '2', '0', '0', '1', '0', 'g', 'w', '-', '-', '-', '-', '-',
    'w', '0', 'w', '0', '1', 'w', '1', '0', '1', '0', 'w', 'G', 'w', '-', '-', '-', '-', '-',
    'w', '0', '0', '0', 'w', 'w', '0', '1', '0', '0', 'w', '3', 'w', '-', '-', '-', '-', '-',
    'w', 'p', '0', '0', '1', '0', '1', 'w', '1', '0', 'w', 'm', 'w', '-', '-', '-', '-', '-',
    'w', 'w', 'w', 'w', '1', 'w', 'w', 'w', '0', '1', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w',
    '-', '-', 'w', '0', '1', '0', '0', '0', '0', '0', '0', 'm', '0', '0', '0', '0', '3', 'o',
    '-', 'b', 'b', 'b', 'b', 'b', 'b', 'b', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w',
    '-', 'b', '-', '-', '-', '-', '-', 'b', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-',
    '-', 'b', 'b', 'b', 'b', 'b', 'b', 'b', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-',
    '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-',
  ];

  const currentPositionOnMap = {
    row: 4,
    column: 1,
  };

  const showMapInteraction = new Interaction(ui, {
    buildMessage() {
      // 🟥🟧🟨🟩🟦 🟪⬛️⬜️🟫
      let mapPiece = '';
      mapPiece += '⬛️ - недостижимое место\n';
      mapPiece += '🟫 - wall, стена, нет прохода\n';
      mapPiece += '🟪 - break, обрыв, нет прохода\n';
      mapPiece += '⬜️ - чистое место\n';
      mapPiece += '🟦 - merchant, торговец\n';
      mapPiece += '🟩 - player, игрок\n';
      mapPiece += '🟥 - out, выход\n';
      mapPiece += '🟨 - gold, золото\n';
      mapPiece += '❔ - не разведанная территория\n';
      mapPiece += '    N\n';
      mapPiece += 'W - X - E\n';
      mapPiece += '    S\n';
      mapPiece += '\n';
      for (let row = currentPositionOnMap.row - 1; row <= currentPositionOnMap.row + 1; row += 1) {
        mapPiece += '';
        for (let column = currentPositionOnMap.column - 1; column <= currentPositionOnMap.column + 1; column += 1) {
          const cell = map[row * 18 + column];
          if (row === currentPositionOnMap.row && column === currentPositionOnMap.column) mapPiece += '🟩';
          else if (cell === '1' || cell === '2' || cell === '3') mapPiece += '❔';
          else if (cell === '-') mapPiece += '⬛️';
          else if (cell === 'w') mapPiece += '🟫';
          else if (cell === 'b') mapPiece += '🟪';
          else if (cell === '0') mapPiece += '⬜️';
          else if (cell === 'm') mapPiece += '🟦';
          else if (cell === 'o') mapPiece += '🟥';
          else if (cell === 'g') mapPiece += '🟨';
          else if (cell === 'p') mapPiece += '⬜️';
        }
        mapPiece += '\n';
      }
      ui.sendToUser(mapPiece, 'markdown');
      return 'mapPiece';
    }
  });

  const interactiveMap: Map<string, AbstractInteraction> = new Map();
  let userPositionInteraction: AbstractInteraction | null = null;

  for (let rowIndex = 0; rowIndex < 11; rowIndex += 1) {
    for (let columnIndex = 0; columnIndex < 18; columnIndex += 1) {
      const cell = map[rowIndex * 18 + columnIndex];
      let inputInteraction: AbstractInteraction | null = null;
      let outputInteraction: AbstractInteraction | null = null;
      if (cell === '0') {
        inputInteraction = new SimpleInteraction(ui, { message: 'Тут ничего и никого нет.' });
        outputInteraction = new Interaction(ui, {
          buildMessage() { return 'Куда дальше?'; },
          async activate() {
            currentPositionOnMap.row = rowIndex;
            currentPositionOnMap.column = columnIndex;
            if (isPresent(outputInteraction)) showMapInteraction.addAction('auto', outputInteraction);
            return 'SUPER';
          },
        });
        inputInteraction.addAction('auto', outputInteraction);
      }
      if (cell === '1' || cell === '2' || cell === '3') {
        const internalInteraction = new SimpleInteraction(ui, { message: 'Больше тут ничего и никого нет.' });
        outputInteraction = new Interaction(ui, {
          buildMessage() { return 'Куда дальше?'; },
          async activate() {
            currentPositionOnMap.row = rowIndex;
            currentPositionOnMap.column = columnIndex;
            if (isPresent(outputInteraction)) showMapInteraction.addAction('auto', outputInteraction);
            return 'SUPER';
          },
        });
        internalInteraction.addAction('auto', outputInteraction);
        inputInteraction = new BattleInteraction(ui, { player: state.player, enemies: Array.from(Array(Number(cell)), (_, index) => new Rat({ typePostfix: `№${index + 1}` }))});
        inputInteraction.addAction('onWin', internalInteraction);
        inputInteraction.addAction('onDied', baseInteractions.lastInteraction);
      }
      if (cell === 'm') {
        const talkToMerchantInteraction = new SimpleInteraction(ui, {
          message: `Здравствуй, ${state.additionalInfo.playerName}. Извини, за столь скудный выбор.\nЧего изволишь?`,
        });

        const buyHealthPointInteraction = new Interaction(ui, {
          buildMessage() { return 'Хороший выбор :)' },
          async activate() {
            const result = state.player.exchangeGoldToItem(10, { healthPoitions: 1 });
            if (!result) ui.sendToUser(`К сожалению, у ${state.player.getType({ declension: 'genitive' })} не хватает золота.`, 'default');
            return 'SUPER';
          }
        });

        inputInteraction = new SimpleInteraction(ui, {
          message: `${state.player.getType({ declension: 'nominative', capitalised: true })} видишь торговца.`,
        });

        inputInteraction.addAction('💬 Поговорить с торговцем', talkToMerchantInteraction);

        talkToMerchantInteraction.addAction('Купить 1 зелье здоровья (10 золтых)', buyHealthPointInteraction);
        buyHealthPointInteraction.addAction('auto', inputInteraction);

        outputInteraction = new Interaction(ui, {
          buildMessage() { return 'Идем дальше?'; },
          async activate() {
            currentPositionOnMap.row = rowIndex;
            currentPositionOnMap.column = columnIndex;
            if (isPresent(outputInteraction)) showMapInteraction.addAction('auto', outputInteraction);
            return 'SUPER';
          },
        });
        inputInteraction.addAction('auto', outputInteraction);
      }
      if (cell === 'o') {
        inputInteraction = new SimpleInteraction(ui, {
          message: `${state.player.getType({ declension: 'nominative', capitalised: true })} добрался до выхода! МОЛОДЕЦ!!!`,
        });

        inputInteraction.addAction('auto', baseInteractions.lastInteraction);

        outputInteraction = inputInteraction;
      }
      if (cell === 'p') {
        inputInteraction = new SimpleInteraction(ui, {
          message: `Перед ${state.player.getType({ declension: 'ablative' })} есть выбор куда идти\n`,
        });

        outputInteraction = new Interaction(ui, {
          buildMessage() { return 'Куда дальше?'; },
          async activate() {
            currentPositionOnMap.row = rowIndex;
            currentPositionOnMap.column = columnIndex;
            if (isPresent(outputInteraction)) showMapInteraction.addAction('auto', outputInteraction);
            return 'SUPER';
          },
        });
        inputInteraction.addAction('auto', outputInteraction);

        userPositionInteraction = inputInteraction;
      }

      if (isPresent(inputInteraction) && isPresent(outputInteraction)) {
        outputInteraction.addAction('Оглядется', showMapInteraction);
        interactiveMap.set(`${rowIndex}:${columnIndex}`, inputInteraction);
        interactiveMap.set(`${rowIndex}:${columnIndex}=o`, outputInteraction);
        const NInteraction = interactiveMap.get(`${rowIndex - 1}:${columnIndex}`);
        const NInteractionOutput = interactiveMap.get(`${rowIndex - 1}:${columnIndex}=o`);
        if (isPresent(NInteraction)) {
          if (isPresent(NInteractionOutput)) NInteractionOutput.addAction('Идти на ЮГ', inputInteraction);
          else NInteraction.addAction('Идти на ЮГ', inputInteraction);
          outputInteraction.addAction('Идти на СЕВЕР', NInteraction);
        }
        const WInteraction = interactiveMap.get(`${rowIndex}:${columnIndex - 1}`);
        const WInteractionOutput = interactiveMap.get(`${rowIndex}:${columnIndex - 1}=o`);
        if (isPresent(WInteraction)) {
          if (isPresent(WInteractionOutput)) WInteractionOutput.addAction('Идти на ЗАПАД', inputInteraction);
          else WInteraction.addAction('Идти на ЗАПАД', inputInteraction);
          WInteraction.addAction('Идти на ЗАПАД', inputInteraction);
          outputInteraction.addAction('Идти на ВОСТОК', WInteraction);
        }
      }
    }
  }

  // const standUpInteraction = new SimpleInteraction(ui, { message: `Перед тобой три пути. Куда пойдешь?\n` });

  // const goForwardInteraction = new Interaction(ui, {
  //   buildMessage() {
  //     return `Ты идешь вперед.`;
  //   },
  //   async activate() {
  //     if (Math.random() > 0.5) {
  //       const battleInteraction = new BattleInteraction(ui, { player: state.player, enemies: [new Rat({ typePostfix: '№1' }), new Rat({ typePostfix: '№2' })] });
  //       battleInteraction.addAction('onWin', standUpInteraction);
  //       battleInteraction.addAction('onDied', baseInteractions.lastInteraction);
  //       return battleInteraction;
  //     }
  //     return standUpInteraction;
  //   }
  // });
  // const goLeftInteraction = new Interaction(ui, {
  //   buildMessage() {
  //     return `Ты идешь влево.`;
  //   },
  //   async activate() {
  //     if (Math.random() > 0.2) {
  //       const battleInteraction = new BattleInteraction(ui, { player: state.player, enemies: [new Rat({ typePostfix: '№1' })] });
  //       battleInteraction.addAction('onWin', standUpInteraction);
  //       battleInteraction.addAction('onDied', baseInteractions.lastInteraction);
  //       return battleInteraction;
  //     }
  //     return standUpInteraction;
  //   }
  // });
  // const goRightInteraction = new Interaction(ui, {
  //   buildMessage() {
  //     return `Ты идешь вправо.`;
  //   },
  //   async activate() {
  //     if (Math.random() > 0.8) {
  //       const battleInteraction = new BattleInteraction(ui, { player: state.player, enemies: [new Rat({ typePostfix: '№1' }), new Rat({ typePostfix: '№2' }), new Rat({ typePostfix: '№3' })] });
  //       battleInteraction.addAction('onWin', standUpInteraction);
  //       battleInteraction.addAction('onDied', baseInteractions.lastInteraction);
  //       return battleInteraction;
  //     }
  //     return standUpInteraction;
  //   }
  // });

  introInteraction.addAction('auto', mainInteraction);
  mainInteraction.addAction('Оглядется', overviewInteraction);
  if (isPresent(userPositionInteraction)) mainInteraction.addAction('Встать', userPositionInteraction);
  mainInteraction.addAction('Закончить игру', baseInteractions.exitInteraction);
  overviewInteraction.addAction('auto', mainInteraction);
  seeMyselfInteraction.addAction('auto', mainInteraction);

  // standUpInteraction
  //   .addAction('Пойти налево', goLeftInteraction)
  //   .addAction('Пойти прямо', goForwardInteraction)
  //   .addAction('Пойти направо', goRightInteraction)
  //   .addAction('Закончить игру', baseInteractions.exitInteraction);

  return introInteraction;
};
