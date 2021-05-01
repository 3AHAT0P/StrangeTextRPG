import { Rat } from "../../actors/Rat";
import { AbstractInteraction, Interactable } from "../../interactions/AbstractInteraction";
import { BattleInteraction } from "../../interactions/BattleInteraction";
import { Interaction } from "../../interactions/Interaction";
import { NextLocation, getBaseInteractions } from "../../interactions/scenario";
import { SimpleInteraction } from "../../interactions/SimpleInteraction";
import { SessionState } from "../../SessionState";
import { AbstractUI } from "../../ui/AbstractUI";
import { Point, Size } from "../../utils/@types";
import { isPresent } from "../../utils/check";

import { map, mapObjects, mapSize } from './map';

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

const mapSigns: Record<mapObjects, string> = {
  '-': '⬛️',
  'w': '🟫',
  'b': '🟪',
  '0': '⬜️',
  'm': '🔵',
  'p': '🔹',
  'o': '🟥',
  'g': '💰',
  '?': '❔',
  '1': '1',
  '2': '2',
  '3': '3',
  '4': '4',
  '5': '5',
} as const;

export class RuinLocation extends AbstractLocation {
  private printMap(currentPosition: Point, userVisibleMap: mapObjects[], mapSize: Size): string {
    // 🟥🟧🟨🟩🟦 🟪⬛️⬜️🟫
    // 🔴🟠🟡🟢🔵🟣⚫️⚪️🟤
    // 🔸🔹🔶🔷♦️
    // 🚪 💰
    let mapPiece = '';
    mapPiece += '⬛️ - недостижимое место\n';
    mapPiece += '🟫 - wall, стена, нет прохода\n';
    mapPiece += '🟪 - break, обрыв, нет прохода\n';
    mapPiece += '⬜️ - чистое место\n';
    mapPiece += '🔵 - merchant, торговец\n';
    mapPiece += '🔹 - player, игрок\n';
    mapPiece += '🟥 - out, выход\n';
    mapPiece += '🔸 - gold, золото\n';
    mapPiece += '❔ - не разведанная территория\n';
    mapPiece += '⬆️ - N (Север)\n';
    mapPiece += '➡️ - E (Восток)\n';
    mapPiece += '⬇️ - S (Юг)\n';
    mapPiece += '⬅️ - W (Запад)\n';
    mapPiece += '\n';
    for (let y = currentPosition.y - 1; y <= currentPosition.y + 1; y += 1) {
      mapPiece += '';
      if (y < 0 || y > mapSize.height - 1) continue;
      for (let x = currentPosition.x - 1; x <= currentPosition.x + 1; x += 1) {
        if (x < 0 || x > mapSize.width - 1) continue;
        const cell = userVisibleMap[y * mapSize.width + x];
        if (y === currentPosition.y && x === currentPosition.x) mapPiece += '🔹';
        else if (cell === 'p') mapPiece += '⬜️';
        else mapPiece += mapSigns[cell];
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
    const userPositionIndex = map.indexOf('p');
    currentPosition.y = Math.ceil(userPositionIndex / mapSize.width);
    currentPosition.x = userPositionIndex - currentPosition.y * mapSize.width;

    const userVisibleMap = map.map<mapObjects>(() => '?');

    const options: string[] = ['Оглядется', 'Встать'];
    let walkOptions: string[] = [];

    const internalPlayerState = {
      isStandUp: false,
    };

    // 'Идти на СЕВЕР';
    // 'Идти на ЮГ';
    // 'Идти на ЗАПАД';
    // 'Идти на ВОСТОК';


    while (isTrue) {
      // await this.ui.sendToUser(`Что будешь делать?\n`, 'default');

      const option = await this.ui.interactWithUser('Что будешь делать?', options.concat(walkOptions));
      if (option === 'Оглядется' && !internalPlayerState.isStandUp) {
        options.push('Посмотреть на себя в лужу');
        await this.ui.sendToUser(`Сумрачно.`
          + ` ${player.getType({ declension: 'nominative', capitalised: true })} сидишь опёршись на уцелевший угол стены.`
          + ` Над ${player.getType({ declension: 'ablative' })} есть небольшой кусок крыши. Рядом почти потухший костер.`
          + ` Поодаль везде грязь и лужи. Моросит мелкий дождик.\n`,
          'default',
        );
      } else if (option === 'Оглядется' && internalPlayerState.isStandUp) {
        await this.ui.sendToUser(this.printMap(currentPosition, userVisibleMap, mapSize), 'default');
      } else if (option === 'Посмотреть на себя в лужу') {
        const stats = player.stats;
        this.ui.sendToUser(`${player.getType({ declension: 'possessive', capitalised: true })} характеристики:\n`
          + `Очки здоровья - ${stats.healthPoints} / ${stats.maxHealthPoints}\n`
          + `Защита - ${stats.armor}\n`
          + `Сила удара - ${stats.attackDamage}\n`
          + `Шанс попасть ударом - ${stats.accuracy}\n`
          + `Шанс попасть в уязвимое место - ${stats.criticalChance}\n`
          + `В кармане звенят ${player.gold} золота\n`,
          'default',
        );
      } else if (option === 'Встать') {
        internalPlayerState.isStandUp = true;
        options.splice(options.indexOf('Встать'), 1);
      } else if (option.startsWith('Идти на')) {
        if (option === 'Идти на ЗАПАД') {
          currentPosition.x -= 1;
        } else if (option === 'Идти на ВОСТОК') {
          currentPosition.x += 1;
        } else if (option === 'Идти на СЕВЕР') {
          currentPosition.y -= 1;
        } else if (option === 'Идти на ЮГ') {
          currentPosition.y += 1;
        }
        const currentPositionIndex = currentPosition.y * mapSize.width + currentPosition.x;
        for (let y = currentPosition.y - 1; y <= currentPosition.y + 1; y += 1) {
          if (y < 0 || y > mapSize.height - 1) continue;
          for (let x = currentPosition.x - 1; x <= currentPosition.x + 1; x += 1) {
            if (x < 0 || x > mapSize.width - 1) continue;
            userVisibleMap[y * mapSize.width + x] = map[y * mapSize.width + x];
          }
        }

        walkOptions = [];

        if (map[currentPositionIndex] === 'm') {
          // await this.ui.sendToUser(`${player.getType({ declension: 'nominative', capitalised: true })} видишь торговца.`, 'default');
          // walkOptions.push('💬 Поговорить с торговцем');

          // const talkToMerchantInteraction = new SimpleInteraction(ui, {
          //   message: `Здравствуй, ${this.state.additionalInfo.playerName}. Извини, за столь скудный выбор.\nЧего изволишь?`,
          // });

          // const buyHealthPointInteraction = new Interaction(ui, {
          //   buildMessage() { return 'Хороший выбор :)' },
          //   async activate() {
          //     const result = state.player.exchangeGoldToItem(10, { healthPoitions: 1 });
          //     if (!result) ui.sendToUser(`К сожалению, у ${state.player.getType({ declension: 'genitive' })} не хватает золота.`, 'default');
          //     return 'SUPER';
          //   }
          // });

          // inputInteraction.addAction('💬 Поговорить с торговцем', talkToMerchantInteraction);

          // talkToMerchantInteraction.addAction('Купить 1 зелье здоровья (10 золтых)', buyHealthPointInteraction);
          // buyHealthPointInteraction.addAction('auto', inputInteraction);

          // outputInteraction = new Interaction(ui, {
          //   buildMessage() { return 'Идем дальше?'; },
          //   async activate() {
          //     currentPositionOnMap.row = rowIndex;
          //     currentPositionOnMap.column = columnIndex;
          //     if (isPresent(outputInteraction)) showMapInteraction.addAction('auto', outputInteraction);
          //     return 'SUPER';
          //   },
          // });
          // inputInteraction.addAction('auto', outputInteraction);
        }
      } else if (option === '💬 Поговорить с торговцем') {
        const merchantGoods = {
          oneHealthPoition: 'Купить 1 зелье здоровья (10 золтых)',
        };
        const buyOption = await this.ui.interactWithUser(
          `Здравствуй, ${this.state.additionalInfo.playerName}. Извини, за столь скудный выбор.\nЧего изволишь?`,
          [merchantGoods.oneHealthPoition],
        );
        if (buyOption === merchantGoods.oneHealthPoition) {
          const result = player.exchangeGoldToItem(10, { healthPoitions: 1 });
          if (!result) this.ui.sendToUser(`К сожалению, у ${player.getType({ declension: 'genitive' })} не хватает золота.`, 'default');
        }
      }


      if (internalPlayerState.isStandUp) {
        const currentPositionIndex = currentPosition.y * mapSize.width + currentPosition.x;
        if (currentPosition.x > 0 && !['w', 'b', '-'].includes(map[currentPositionIndex - 1])) {
          walkOptions.push('Идти на ЗАПАД');
        }
        if (currentPosition.x < mapSize.width - 1 && !['w', 'b', '-'].includes(map[currentPositionIndex + 1])) {
          walkOptions.push('Идти на ВОСТОК');
        }
        if (currentPosition.y > 0 && !['w', 'b', '-'].includes(map[currentPositionIndex - mapSize.width])) {
          walkOptions.push('Идти на СЕВЕР');
        }
        if (currentPosition.y < mapSize.height - 1 && !['w', 'b', '-'].includes(map[currentPositionIndex + mapSize.width])) {
          walkOptions.push('Идти на ЮГ');
        }
      }
    }


    const toBeContinuedInteraction = new SimpleInteraction(this.ui, {
      message: `Продолжение следует...`,
    });

    return toBeContinuedInteraction;
  }
}




export const buildThirdLocation = (ui: AbstractUI, state: SessionState, nextLocation?: NextLocation): AbstractInteraction => {
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