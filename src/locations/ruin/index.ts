import { Rat } from "../../actors/Rat";
import { AbstractInteraction, Interactable } from "../../interactions/AbstractInteraction";
import { BattleInteraction } from "../../interactions/BattleInteraction";
import { Interaction } from "../../interactions/Interaction";
import { NextLocation, getBaseInteractions } from "../../interactions/scenario";
import { SimpleInteraction } from "../../interactions/SimpleInteraction";
import { SessionState } from "../../SessionState";
import { AbstractUI } from "../../ui/AbstractUI";
import { isPresent } from "../../utils/check";

import { map } from './map';

export interface AbstractLocationOptions {
  ui: AbstractUI;
  state: SessionState;
  nextLocation?: AbstractLocation;
}

export abstract class AbstractLocation implements Interactable {
  protected ui: AbstractUI;
  protected state: SessionState;

  constructor(options: AbstractLocationOptions) {
    this.ui = options.ui;
    this.state = options.state;
  }

  public abstract activate(): Promise<AbstractInteraction | null>;
}

export interface Point {
  x: number;
  y: number;
}

export class RuinLocation extends AbstractLocation {
  private printMap(currentPosition: Point, userVisibleMap: string[], mapSize: ): string {
    // 🟥🟧🟨🟩🟦 🟪⬛️⬜️🟫
    let mapPiece = '';
    mapPiece += '⬛️ - недостижимое место\n';
    mapPiece += '🟫 - wall, стена, нет прохода\n';
    mapPiece += '🟪 - break, обрыв, нет прохода\n';
    mapPiece += '⬜️ - чистое место\n';
    mapPiece += '🟦 - merchant, торговец\n';
    mapPiece += '🔹 - player, игрок\n';
    mapPiece += '🟥 - out, выход\n';
    mapPiece += '🟨 - gold, золото\n';
    mapPiece += '❔ - не разведанная территория\n';
    mapPiece += '⬆️ - N (Север)\n';
    mapPiece += '➡️ - E (Восток)\n';
    mapPiece += '⬇️ - S (Юг)\n';
    mapPiece += '⬅️ - W (Запад)\n';
    mapPiece += '\n';
    for (let y = currentPosition.y - 1; y <= currentPosition.y + 1; y += 1) {
      mapPiece += '';
      for (let x = currentPosition.x - 1; x <= currentPosition.x + 1; x += 1) {
        const cell = userVisibleMap[y * 18 + x];
        if (y === currentPosition.y && x === currentPosition.x) mapPiece += '🔹';
        else if (cell === '?') mapPiece += '❔';
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
    return mapPiece;
  }

  public async activate(): Promise<AbstractInteraction | null> {

    const player = this.state.player;

    await this.ui.sendToUser(`Привет ${this.state.additionalInfo.playerName}.\n`
      + `${player.getType({ declension: 'nominative', capitalised: true })} очнулся посреди каких-то руин.\n`
      + `${player.getType({ declension: 'nominative', capitalised: true })} не знаешь кто ты, зачем ты и что вообще произошло.\n`,
      'default',
    );

    const isTrue = true;

    const currentPosition = { x: 0, y: 0 };
    const userVisibleMap = map.map(() => '?');

    while (isTrue) {

    }

    await this.ui.sendToUser(`Сумрачно.`
      + ` ${player.getType({ declension: 'nominative', capitalised: true })} сидишь опёршись на уцелевший угол стены.`
      + ` Над ${player.getType({ declension: 'ablative' })} есть небольшой кусок крыши. Рядом почти потухший костер.`
      + ` Поодаль везде грязь и лужи. Моросит мелкий дождик.\n`,
      'default',
    );



    const mainInteraction = new SimpleInteraction(ui, { message: `Что будешь делать?\n` });

    const overviewInteraction = new Interaction(ui, {
      buildMessage() {
        return `Сумрачно.`
          + ` ${state.player.getType({ declension: 'nominative', capitalised: true })} сидишь опёршись на уцелевший угол стены.`
          + ` Над ${state.player.getType({ declension: 'ablative' })} есть небольшой кусок крыши. Рядом почти потухший костер.`
          + ` Поодаль везде грязь и лужи. Моросит мелкий дождик.\n`;
      },
      async activate() {
        mainInteraction.addAction('Посмотреть на себя в лужу', seeMyselfInteraction);
        return 'SUPER';
      }
    });





    const toBeContinuedInteraction = new SimpleInteraction(this.ui, {
      message: `Продолжение следует...`,
    });

    return toBeContinuedInteraction;
  }
}




export const buildThirdLocation = async (ui: AbstractUI, state: SessionState, nextLocation?: NextLocation): AbstractInteraction => {
  const baseInteractions = getBaseInteractions(ui, state);


  baseInteractions.lastInteraction.removeAction('ВСЕ! ХВАТИТ С МЕНЯ!');
  baseInteractions.lastInteraction.addAction('Закончить игру', baseInteractions.exitInteraction);
  if (nextLocation != null) baseInteractions.lastInteraction.addAction(nextLocation.actionMessage, nextLocation.interaction);

  const mainInteraction = new SimpleInteraction(ui, { message: `Что будешь делать?\n` });

  const overviewInteraction = new Interaction(ui, {
    buildMessage() {
      return `Сумрачно.`
        + ` ${state.player.getType({ declension: 'nominative', capitalised: true })} сидишь опёршись на уцелевший угол стены.`
        + ` Над ${state.player.getType({ declension: 'ablative' })} есть небольшой кусок крыши. Рядом почти потухший костер.`
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
        inputInteraction = new BattleInteraction(ui, { player: state.player, enemies: Array.from(Array(Number(cell)), (_, index) => new Rat({ typePostfix: `№${index + 1}` })) });
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