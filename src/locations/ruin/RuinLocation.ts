/* eslint-disable no-await-in-loop */
import {
  AbstractActor,
  Player,
  Rat, Skeleton,
} from '@actors';
import { KnifeWeapon } from '@weapon';
import { MerchantNPC } from '@NPC/Merchant';
import {
  AbstractInteraction, Interaction,
  BattleInteraction, BATTLE_FINAL_ACTIONS,
} from '@interactions';
import { ActionsLayout } from '@ui/ActionsLayout';
import { getRandomIntInclusive } from '@utils/getRandomIntInclusive';
import { capitalise } from '@utils/capitalise';

import { AreaMap } from '../AreaMap';
import { AbstractLocation } from '../AbstractLocation';

import { map, mapSize, additionalMapInfo } from './map';
import { descriptions } from '../LocationDescriptions';

export const RUIN_LOCATION_ACTIONS = {
  PLAYER_DIED: 'onPlayerDied',
} as const;

const ACTIONS = {
  LOOK_AROUND: 'Осмотреться',
  STAND_UP: 'Встать',
  LOOK_AT_YOURSELF: 'Посмотреть на себя в лужу',
} as const;

type ACTION_VALUES = typeof ACTIONS[keyof typeof ACTIONS];

const MOVE_ACTIONS = {
  TO_WEST: '👣 ⬅️',
  TO_EAST: '👣 ➡️',
  TO_NORTH: '👣 ⬆️',
  TO_SOUTH: '👣 ⬇️',
  NO_WAY: '🚷',
} as const;

type MOVE_ACTION_VALUES = typeof MOVE_ACTIONS[keyof typeof MOVE_ACTIONS];

const MOVE_DIRECTIONS = {
  WEST: 'Запад',
  EAST: 'Восток',
  NORTH: 'Север',
  SOUTH: 'Юг',
} as const;

const SITUATIONAL_ACTIONS = {
  EXAMINE_CORPSE: '👀 Осмотреть труп',
  TALK_WITH_MERCHANT: '💬 Поговорить с торговцем',
  PICK_UP_GOLD: '💰 Подобрать золото',

} as const;

type SITUATIONAL_ACTION_VALUES = typeof SITUATIONAL_ACTIONS[keyof typeof SITUATIONAL_ACTIONS];

export class RuinLocation extends AbstractLocation {
  private createBattle(
    player: AbstractActor,
    enemies: AbstractActor[],
    nextInteraction: AbstractInteraction,
  ): BattleInteraction {
    const battle = new BattleInteraction({ ui: this.ui, player, enemies });
    const onDiedInteraction = this.actions.getInteractionByAction('onDied');
    if (onDiedInteraction != null) battle.addAction(BATTLE_FINAL_ACTIONS.PLAYER_DIED, onDiedInteraction);
    battle.addAction(BATTLE_FINAL_ACTIONS.PLAYER_WIN, nextInteraction);
    return battle;
  }

  private async doBattle(player: AbstractActor, enemies: AbstractActor[]): Promise<boolean> {
    const battle = new BattleInteraction({ ui: this.ui, player, enemies });
    const onDiedInteraction = this.actions.getInteractionByAction('onDied');
    if (onDiedInteraction != null) battle.addAction(BATTLE_FINAL_ACTIONS.PLAYER_DIED, onDiedInteraction);
    await battle.interact();

    return player.isAlive;
  }

  private async printFAQ(): Promise<void> {
    await this.ui.sendToUser(''
      + '*** Общее ***\n'
      + '💬 [кто говорит]: - диалоговая фраза\n'
      + '⚙️ {...} - системные сообщения\n'
      + '📀 - Золото\n'
      + '💿 - Серебро\n'
      + '\n*** Карта ***\n'
      + '⬛️ - недостижимое место\n'
      + '🟫 - wall, стена, нет прохода\n'
      + '🟪 - break, обрыв, нет прохода\n'
      + '⬜️ - чистое место\n'
      + '🔵 - merchant, торговец\n'
      + '🔹 - player, игрок\n'
      + '🟥 - out, выход\n'
      + '🔸 - gold, золото\n'
      + '❔ - не разведанная территория\n'
      + '⬆️ - N (Север)\n'
      + '➡️ - E (Восток)\n'
      + '⬇️ - S (Юг)\n'
      + '⬅️ - W (Запад)\n');
  }

  private async printAmbientDescription(ruinAreaMap: AreaMap) {
    const ambiences = ruinAreaMap.countAroundAmbiences();
    const ambientDescriptions = (Object.keys(ambiences) as Array<keyof typeof ambiences>)
      .reduce<string[]>((acc, key) => {
      if (ambiences[key] > 0) {
        return [...acc, ...descriptions[key]];
      }
      return acc;
    },
    []);
    ambientDescriptions.push(...descriptions.default);
    await this.ui.sendToUser(ambientDescriptions[getRandomIntInclusive(0, ambientDescriptions.length - 1)], true);
  }

  private printEquipment(player: Player): string {
    const equipment = [];
    if (player.wearingEquipment.body != null) equipment.push(`  ${capitalise(player.wearingEquipment.body.name)}`);
    if (player.wearingEquipment.legs != null) equipment.push(`  ${capitalise(player.wearingEquipment.legs.name)}`);

    return equipment.join('\n');
  }

  private async lookYourself(): Promise<void> {
    const player = this.state.player as Player;

    await this.ui.sendToUser(`${player.getType({ declension: 'nominative', capitalised: true })} пристально всматриваешься в отражение.`);
    const { stats } = player;
    // TODO: Сделать для вещей нормальный текст отображения!
    await this.ui.sendToUser(`${`${player.getType({ declension: 'possessive', capitalised: true })} характеристики:\n`
      + `  Очки здоровья(❤️) - ${stats.healthPoints} / ${stats.maxHealthPoints}\n`
      + `  Защита(🛡) - ${stats.armor}\n`
      + `  Сила удара(🗡) - ${stats.attackDamage}\n`
      + `  Шанс попасть ударом(🎯) - ${stats.accuracy}\n`
      + `  Шанс попасть в уязвимое место(‼️) - ${stats.criticalChance}\n`
      + `  Модификатор критического урона(✖️) - ${stats.criticalDamageModifier}\n`
      + `  В кармане звенят(💰) ${player.gold} золота\n`
      + `\nНа ${player.getType({ declension: 'dative' })} надеты:\n`}${this.printEquipment(player)}\n`
      + `Оружие - ${player.wearingEquipment.rightHand?.name ?? 'ничего'}.\n`);
  }

  public async activate(): Promise<string> {
    const ruinAreaMap = new AreaMap(map, mapSize, additionalMapInfo);

    const player = this.state.player as Player;

    const nullInteraction = new Interaction({ ui: this.ui, async activate() { return null; } });

    const gameMenu = await this.ui.showPersistentActions(
      'Игровое меню',
      new ActionsLayout({ columns: 4 }).addRow('❓', 'Открыть инвертарь'),
      (action) => {
        if (action === '❓') void this.printFAQ();
        else if (action === 'Открыть инвертарь') console.log('Inventory open');
        else if (action === 'Посмотреть на себя в лужу') void this.lookYourself();
      },
    );

    this.state.persistActionsContainers.push(gameMenu);

    await this.ui.sendToUser(`Привет ${this.state.additionalInfo.playerName}.\n`
      + `${player.getType({ declension: 'nominative', capitalised: true })} очнулся посреди руин.\n`
      + `${player.getType({ declension: 'nominative', capitalised: true })} не знаешь кто ты, где ты, зачем ты и что вообще произошло.\n`);

    const isTrue = true;

    const actions: Set<ACTION_VALUES> = new Set([ACTIONS.LOOK_AROUND, ACTIONS.STAND_UP]);
    const localActions: Set<SITUATIONAL_ACTION_VALUES> = new Set();
    let moveActions: MOVE_ACTION_VALUES[] = [];

    const internalPlayerState = {
      isStandUp: false,
      seeRatCorpse: async () => { /* pass */ },
    };

    while (isTrue) {
      const choosedAction = await this.ui.interactWithUser(
        new ActionsLayout<ACTION_VALUES | MOVE_ACTION_VALUES | SITUATIONAL_ACTION_VALUES>({ columns: 4 })
          .addRow(...actions)
          .addRow(...localActions)
          .addRow(...moveActions),
        (action) => action !== MOVE_ACTIONS.NO_WAY,
      );
      if (choosedAction === ACTIONS.LOOK_AROUND && !internalPlayerState.isStandUp) {
        await this.ui.sendToUser(`${player.getType({ declension: 'nominative', capitalised: true })} оглядываешься по сторонам.`);
        await this.ui.sendToUser('Сумрачно.'
          + ` ${player.getType({ declension: 'nominative', capitalised: true })} сидишь опёршись на уцелевший угол стены.`
          + ` Над ${player.getType({ declension: 'ablative' })} есть небольшой кусок крыши. Рядом почти потухший костер.`
          + ' Поодаль везде грязь и лужи. Моросит мелкий дождик.\n');
        await gameMenu.updateKeyboard(new ActionsLayout({ columns: 4 })
          .addRow('❓', 'Открыть инвертарь')
          .addRow('Посмотреть на себя в лужу'));
        await this.ui.sendToUser('⚙️ {В меню добавлено новое действие}');
        actions.delete(ACTIONS.LOOK_AROUND);
      } else if (choosedAction === ACTIONS.STAND_UP) {
        await this.ui.sendToUser(`${player.getType({ declension: 'nominative', capitalised: true })} аккуратно встаешь опираясь на стену. Все тело болит и сопротивляется.`);
        internalPlayerState.isStandUp = true;
        actions.delete(ACTIONS.STAND_UP);
        actions.delete(ACTIONS.LOOK_AROUND);
      } else if (choosedAction.startsWith('Идти на') || choosedAction.startsWith('👣')) { // @TODO:
        let direction: keyof typeof MOVE_DIRECTIONS = 'WEST';
        if (choosedAction === MOVE_ACTIONS.TO_WEST) direction = 'WEST';
        else if (choosedAction === MOVE_ACTIONS.TO_EAST) direction = 'EAST';
        else if (choosedAction === MOVE_ACTIONS.TO_NORTH) direction = 'NORTH';
        else if (choosedAction === MOVE_ACTIONS.TO_SOUTH) direction = 'SOUTH';
        await this.ui.sendToUser(`${player.getType({ declension: 'nominative', capitalised: true })} идешь на ${MOVE_DIRECTIONS[direction]}.`);
        ruinAreaMap.move(direction);
        ruinAreaMap.lookAround();
        await this.printAmbientDescription(ruinAreaMap);
        await this.ui.sendToUser(`Осматривая пространство вокруг себя, ${player.getType({ declension: 'nominative' })} видишь`);
        await this.ui.sendToUser(ruinAreaMap.printMap());

        localActions.clear();

        const { currentSpot } = ruinAreaMap;

        if (currentSpot == null) {
          console.error('Oops, something went wrong!');
        } else if (currentSpot.type === 'EVENT') {
          // const info = ruinAreaMap.currentSpot?.additionalInfo;
          if (currentSpot.icon === 'E1') {
            await this.ui.sendToUser(`Внезапно, ${player.getType({ declension: 'nominative' })} спотыкаешься о труп крысы.`);
            localActions.add(SITUATIONAL_ACTIONS.EXAMINE_CORPSE);
            // TODO: It's Interaction????
            internalPlayerState.seeRatCorpse = async () => {
              await this.ui.sendToUser(
                'Крыса, как крыса. Но в боку у нее торчит нож. О, теперь будет чем отбиваться от этих тварей!',
              ); '';
              player.equipWeapon(new KnifeWeapon('LEGENDARY'));
            };
          }
        } else if (currentSpot.type === 'MERCHANT') {
          await this.ui.sendToUser(`${player.getType({ declension: 'nominative', capitalised: true })} видишь торговца.`);
          localActions.add(SITUATIONAL_ACTIONS.TALK_WITH_MERCHANT);
        } else if (currentSpot.type === 'VERY_EASY_BATTLE') {
          const enemies = [new Rat({ typePostfix: '№1' })];

          if (!(await this.doBattle(player, enemies))) return RUIN_LOCATION_ACTIONS.PLAYER_DIED;

          ruinAreaMap.updateSpot(ruinAreaMap.playerPosition, 'CLEAN');
          await this.ui.sendToUser('Больше тут ничего и никого нет.');
        } else if (currentSpot.type === 'EASY_BATTLE') {
          const enemies = [new Rat({ typePostfix: '№1' }), new Rat({ typePostfix: '№2' })];

          if (!(await this.doBattle(player, enemies))) return RUIN_LOCATION_ACTIONS.PLAYER_DIED;

          ruinAreaMap.updateSpot(ruinAreaMap.playerPosition, 'CLEAN');
          await this.ui.sendToUser('Больше тут ничего и никого нет.');
        } else if (currentSpot.type === 'MEDIUM_BATTLE') {
          const enemies = [
            new Rat({ typePostfix: '№1' }),
            new Rat({ typePostfix: '№2' }),
            new Rat({ typePostfix: '№3' }),
          ];

          if (!(await this.doBattle(player, enemies))) return RUIN_LOCATION_ACTIONS.PLAYER_DIED;

          ruinAreaMap.updateSpot(ruinAreaMap.playerPosition, 'CLEAN');
          await this.ui.sendToUser('Больше тут ничего и никого нет.');
        } else if (currentSpot.type === 'HARD_BATTLE') {
          const enemies = [
            new Rat({ typePostfix: '№1' }),
            new Rat({ typePostfix: '№2' }),
            new Rat({ typePostfix: '№3' }),
            new Skeleton({ typePostfix: '№1' }),
            new Skeleton({ typePostfix: '№2' }),
          ];

          if (!(await this.doBattle(player, enemies))) return RUIN_LOCATION_ACTIONS.PLAYER_DIED;

          ruinAreaMap.updateSpot(ruinAreaMap.playerPosition, 'CLEAN');
          await this.ui.sendToUser('Больше тут ничего и никого нет.');
        } else if (currentSpot.type === 'VERY_HARD_BATTLE') {
          const enemies = [
            new Skeleton({ typePostfix: '№1' }),
            new Skeleton({ typePostfix: '№2' }),
            new Skeleton({ typePostfix: '№3' }),
            new Skeleton({ typePostfix: '№4' }),
            new Skeleton({ typePostfix: '№5' }),
          ];

          if (!(await this.doBattle(player, enemies))) return RUIN_LOCATION_ACTIONS.PLAYER_DIED;

          ruinAreaMap.updateSpot(ruinAreaMap.playerPosition, 'CLEAN');
          await this.ui.sendToUser('Больше тут ничего и никого нет.');
        } else if (currentSpot.type === 'GOLD') {
          await this.ui.sendToUser(`${player.getType({ declension: 'nominative', capitalised: true })} замечаешь некоторое количество золота под ногами.`);
          localActions.add(SITUATIONAL_ACTIONS.PICK_UP_GOLD);
        } else if (currentSpot.type === 'EXIT') {
          await this.ui.sendToUser(`${player.getType({ declension: 'nominative', capitalised: true })} идешь по импровизированному коридору из обломков стен.\n`
            + 'По мере твоего продвижения вперед, воздух становится чище и свежее.\n'
            + `Похоже, ${player.getType({ declension: 'nominative' })} выбрался...\n`
            + `Еще через некоторое время продвижения, ${player.getType({ declension: 'nominative' })} видишь конец коридора и человека с повозкой возле него.`,
          true);
          break;
        }
      } else if (choosedAction === SITUATIONAL_ACTIONS.TALK_WITH_MERCHANT) {
        const merchantGoods = new Set([
          {
            name: 'healthPoitions',
            message: 'Зелье лечения = 10 золотых (📀)',
            action: 'Купить зелье лечения',
            price: 10,
          },
        ]);

        let interaction: AbstractInteraction = new MerchantNPC({
          ui: this.ui,
          player,
          goods: merchantGoods,
        });

        interaction.addAutoAction(nullInteraction);

        while (isTrue) {
          const nextInteraction: AbstractInteraction | null = await interaction.interact();
          if (nextInteraction == null) break;

          interaction = nextInteraction;
        }
      } else if (choosedAction === SITUATIONAL_ACTIONS.PICK_UP_GOLD) {
        const reward = getRandomIntInclusive(1, 10);
        localActions.delete(SITUATIONAL_ACTIONS.PICK_UP_GOLD);
        ruinAreaMap.updateSpot(ruinAreaMap.playerPosition, 'CLEAN');
        player.collectReward({ gold: reward });
        await this.ui.sendToUser(`${player.getType({ declension: 'nominative', capitalised: true })} подбираешь ${reward} золота.`);
      } else if (choosedAction === SITUATIONAL_ACTIONS.EXAMINE_CORPSE) {
        await this.ui.sendToUser(`${player.getType({ declension: 'nominative', capitalised: true })} осматриваешь труп крысы.`);
        localActions.delete(SITUATIONAL_ACTIONS.EXAMINE_CORPSE);
        ruinAreaMap.updateSpot(ruinAreaMap.playerPosition, 'CLEAN');
        await internalPlayerState.seeRatCorpse();
      }

      if (internalPlayerState.isStandUp) {
        moveActions = [];

        if (ruinAreaMap.canMove({ x: ruinAreaMap.playerPosition.x - 1, y: ruinAreaMap.playerPosition.y })) {
          moveActions.push(MOVE_ACTIONS.TO_WEST);
        } else moveActions.push(MOVE_ACTIONS.NO_WAY);

        if (ruinAreaMap.canMove({ x: ruinAreaMap.playerPosition.x, y: ruinAreaMap.playerPosition.y - 1 })) {
          moveActions.push(MOVE_ACTIONS.TO_NORTH);
        } else moveActions.push(MOVE_ACTIONS.NO_WAY);

        if (ruinAreaMap.canMove({ x: ruinAreaMap.playerPosition.x + 1, y: ruinAreaMap.playerPosition.y })) {
          moveActions.push(MOVE_ACTIONS.TO_EAST);
        } else moveActions.push(MOVE_ACTIONS.NO_WAY);

        if (ruinAreaMap.canMove({ x: ruinAreaMap.playerPosition.x, y: ruinAreaMap.playerPosition.y + 1 })) {
          moveActions.push(MOVE_ACTIONS.TO_SOUTH);
        } else moveActions.push(MOVE_ACTIONS.NO_WAY);
      }
    }

    return super.activate('Куда теперь?');
  }
}
