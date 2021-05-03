import { Rat } from "../../actors/Rat";
import { AbstractInteraction } from "../../interactions/AbstractInteraction";
import { BattleInteraction } from "../../interactions/BattleInteraction";
import { getBaseInteractions } from "../../scenario";
import { SimpleInteraction } from "../../interactions/SimpleInteraction";
import { getRandomIntInclusive } from "../../utils/getRandomIntInclusive";
import { AbstractLocation } from "../AbstractLocation";

import { map, mapSize, additionalMapInfo } from './map';
import { AreaMap } from "../AreaMap";
import { KnifeWeapon } from "../../actors/weapon";
import { Player } from "../../actors/Player";

const ruinAreaMap = new AreaMap(map, mapSize, additionalMapInfo);

export class RuinLocation extends AbstractLocation {
  public async activate(): Promise<AbstractInteraction | null> {

    const player = this.state.player as Player;

    await this.ui.sendToUser(`Привет ${this.state.additionalInfo.playerName}.\n`
      + `${player.getType({ declension: 'nominative', capitalised: true })} очнулся посреди каких-то руин.\n`
      + `${player.getType({ declension: 'nominative', capitalised: true })} не знаешь кто ты, зачем ты и что вообще произошло.\n`,
      'default',
    );

    const isTrue = true;

    const actions: Set<string> = new Set(['Оглядется', 'Встать']);
    const localActions: Set<string> = new Set();

    const internalPlayerState = {
      isStandUp: false,
      seeRatCorpse: async () => { /* pass */ },
    };

    while (isTrue) {
      // await this.ui.sendToUser(`Что будешь делать?\n`, 'default');

      const choosedAction = await this.ui.interactWithUser('Что будешь делать?', [...actions, ...localActions]);
      if (choosedAction === 'Оглядется' && !internalPlayerState.isStandUp) {
        actions.add('Посмотреть на себя в лужу');
        await this.ui.sendToUser(`Сумрачно.`
          + ` ${player.getType({ declension: 'nominative', capitalised: true })} сидишь опёршись на уцелевший угол стены.`
          + ` Над ${player.getType({ declension: 'ablative' })} есть небольшой кусок крыши. Рядом почти потухший костер.`
          + ` Поодаль везде грязь и лужи. Моросит мелкий дождик.\n`,
          'default',
        );
      } else if (choosedAction === 'Оглядется' && internalPlayerState.isStandUp) {
        ruinAreaMap.lookAround();
        await this.ui.sendToUser(ruinAreaMap.printMap(), 'default');
      } else if (choosedAction === 'Посмотреть на себя в лужу') {
        const stats = player.stats;
        // TODO: Сделать для вещей нормальный текст отображения!
        this.ui.sendToUser(`${player.getType({ declension: 'possessive', capitalised: true })} характеристики:\n`
          + `  ❤️Очки здоровья - ${stats.healthPoints} / ${stats.maxHealthPoints}\n`
          + `  🛡Защита - ${stats.armor}\n`
          + `  🗡Сила удара - ${stats.attackDamage}\n`
          + `  🎯Шанс попасть ударом - ${stats.accuracy}\n`
          + `  ‼️Шанс попасть в уязвимое место - ${stats.criticalChance}\n`
          + `  ✖️Модификатор критического урона - ${stats.criticalDamageModifier}\n`
          + `  💰В кармане звенят ${player.gold} золота\n`
          + `\nНа ${player.getType({ declension: 'dative' })} надеты:\n`
          + `  Поношеная куртка из парусины\n`
          + `  Поношеные штаны из парусины\n`
          + `\nВ руках ${ player.wearingEquipment.rightHand instanceof KnifeWeapon ? 'обычный нож' : 'ничего'}.\n`
          ,
          'default',
        );
      } else if (choosedAction === 'Встать') {
        internalPlayerState.isStandUp = true;
        actions.delete('Встать');
      } else if (choosedAction.startsWith('Идти на')) {

        if (choosedAction === 'Идти на ЗАПАД ⬅️') ruinAreaMap.move('WEST');
        else if (choosedAction === 'Идти на ВОСТОК ➡️') ruinAreaMap.move('EAST');
        else if (choosedAction === 'Идти на СЕВЕР ⬆️') ruinAreaMap.move('NORTH');
        else if (choosedAction === 'Идти на ЮГ ⬇️') ruinAreaMap.move('SOUTH');

        localActions.clear();

        const currentSpot = ruinAreaMap.currentSpot;

        if (currentSpot == null) { console.error('Oops, something went wrong!'); }
        
        else if (currentSpot.type === 'BAG') {
          const info = ruinAreaMap.currentSpot?.additionalInfo;
          if (info != null && info.reward === KnifeWeapon) {
            await this.ui.sendToUser(`Внезапно, ${player.getType({ declension: 'nominative' })} спотыкаешься о труп крысы.`, 'default');
            localActions.add('👀 Осмотреть труп');
            // TODO: It's Interaction????
            internalPlayerState.seeRatCorpse = async () => {
              await this.ui.sendToUser(
                `Крыса, как крыса. Но в боку у нее торчит нож. О, теперь будет чем отбиваться от этих тварей!`,
                'default',
              );
              player.equipWeapon(new KnifeWeapon());
            }
          }
        
        } else if (currentSpot.type === 'MERCHANT') {
          await this.ui.sendToUser(`${player.getType({ declension: 'nominative', capitalised: true })} видишь торговца.`, 'default');
          localActions.add('💬 Поговорить с торговцем');
        
        } else if (currentSpot.type === 'VERY_EASY_BATTLE') {
          const enemies = [new Rat({ typePostfix: '№1' })];
          const battle = new BattleInteraction(this.ui, { player, enemies });
          await battle.activate();
          ruinAreaMap.updateSpot(ruinAreaMap.playerPosition, 'CLEAN');
          this.ui.sendToUser('Больше тут ничего и никого нет.', 'default');
        
        } else if (currentSpot.type === 'EASY_BATTLE') {
          const enemies = [new Rat({ typePostfix: '№1' }), new Rat({ typePostfix: '№1' })];
          const battle = new BattleInteraction(this.ui, { player, enemies });
          await battle.activate();
          ruinAreaMap.updateSpot(ruinAreaMap.playerPosition, 'CLEAN');
          this.ui.sendToUser('Больше тут ничего и никого нет.', 'default');
        
        } else if (currentSpot.type === 'MEDIUM_BATTLE') {
          const enemies = [new Rat({ typePostfix: '№1' }), new Rat({ typePostfix: '№2' }), new Rat({ typePostfix: '№3' })];
          const battle = new BattleInteraction(this.ui, { player, enemies });
          await battle.activate();
          ruinAreaMap.updateSpot(ruinAreaMap.playerPosition, 'CLEAN');
          this.ui.sendToUser('Больше тут ничего и никого нет.', 'default');
        
        } else if (currentSpot.type === 'GOLD') {
          this.ui.sendToUser(`${player.getType({ declension: 'nominative', capitalised: true })} замечаешь некоторое количество золота под ногами.`, 'default');
          localActions.add('💰 Подобрать золото');
        
        } else if (currentSpot.type === 'EXIT') {
          this.ui.sendToUser(`${player.getType({ declension: 'nominative', capitalised: true })} идешь по импровизированному корридору из обомков стен.\n`
            + `По мере твоего продвижения вперед, воздух становится чище и свежее.\n`
            + `Похоже, ${player.getType({ declension: 'nominative' })} выбрался...\n`
            + `Еще через некоторое время продвижения, ${player.getType({ declension: 'nominative' })} видишь конец корридора и человека с повозкой возле него.`,
            'clean',
          );
          break;
        }
      } else if (choosedAction === '💬 Поговорить с торговцем') {
        const merchantGoods = {
          oneHealthPoition: 'Купить 1 зелье здоровья (10 золтых)',
        };
        const buychoosedAction = await this.ui.interactWithUser(
          `Здравствуй, ${this.state.additionalInfo.playerName}. Извини, за столь скудный выбор.\nЧего изволишь?`,
          [merchantGoods.oneHealthPoition],
        );
        if (buychoosedAction === merchantGoods.oneHealthPoition) {
          const result = player.exchangeGoldToItem(10, { healthPoitions: 1 });
          if (!result) this.ui.sendToUser(`К сожалению, у ${player.getType({ declension: 'genitive' })} не хватает золота.`, 'default');
        }

      } else if (choosedAction === '💰 Подобрать золото') {
        const reward = getRandomIntInclusive(1, 10);
        localActions.delete('💰 Подобрать золото');
        ruinAreaMap.updateSpot(ruinAreaMap.playerPosition, 'CLEAN');
        player.collectReward({ gold: reward });
        this.ui.sendToUser(`${player.getType({ declension: 'nominative', capitalised: true })} подбираешь ${reward} золота.`, 'default');

      } else if (choosedAction === '👀 Осмотреть труп') {
        localActions.delete('👀 Осмотреть труп');
        ruinAreaMap.updateSpot(ruinAreaMap.playerPosition, 'CLEAN');
        await internalPlayerState.seeRatCorpse();
      }

      if (internalPlayerState.isStandUp) {
        if (ruinAreaMap.canMove({ x: ruinAreaMap.playerPosition.x - 1, y: ruinAreaMap.playerPosition.y })) {
          localActions.add('Идти на ЗАПАД ⬅️');
        }
        if (ruinAreaMap.canMove({ x: ruinAreaMap.playerPosition.x + 1, y: ruinAreaMap.playerPosition.y })) {
          localActions.add('Идти на ВОСТОК ➡️');
        }
        if (ruinAreaMap.canMove({ x: ruinAreaMap.playerPosition.x, y: ruinAreaMap.playerPosition.y - 1 })) {
          localActions.add('Идти на СЕВЕР ⬆️');
        }
        if (ruinAreaMap.canMove({ x: ruinAreaMap.playerPosition.x, y: ruinAreaMap.playerPosition.y + 1 })) {
          localActions.add('Идти на ЮГ ⬇️');
        }
      }
    }

    const toBeContinuedInteraction = new SimpleInteraction(this.ui, {
      message: `Продолжение следует...`,
    });

    const baseInteractions = getBaseInteractions(this.ui, this.state);
    toBeContinuedInteraction.addAction('Закончить игру', baseInteractions.exitInteraction);
    if (this.nextLocation != null) toBeContinuedInteraction.addAction(this.nextLocation.actionMessage, this.nextLocation.interaction);

    return toBeContinuedInteraction;
  }
}
