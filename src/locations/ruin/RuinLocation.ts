import { Rat } from "../../actors/Rat";
import { BattleInteraction, BATTLE_FINAL_ACTIONS } from "../../interactions/BattleInteraction";
import { getRandomIntInclusive } from "../../utils/getRandomIntInclusive";
import { AbstractLocation } from "../AbstractLocation";

import { map, mapSize, additionalMapInfo } from './map';
import { AreaMap } from "../AreaMap";
import { KnifeWeapon } from "../../actors/weapon";
import { Player } from "../../actors/Player";
import { Skeleton } from "../../actors/Skeleton";
import { capitalise } from "../../utils/capitalise";
import { AbstractActor } from "../../actors/AbstractActor";
import { AbstractInteraction } from "../../interactions/AbstractInteraction";
import { MerchantNPC } from "../../interactions/NPC/Merchant";
import { DropSessionError } from "../../utils/Error/DropSessionError";
import { Interaction } from "../../interactions/Interaction";

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
  TO_WEST: 'Идти на ЗАПАД ⬅️',
  TO_EAST: 'Идти на ВОСТОК ➡️',
  TO_NORTH: 'Идти на СЕВЕР ⬆️',
  TO_SOUTH: 'Идти на ЮГ ⬇️',
} as const;

type MOVE_ACTION_VALUES = typeof MOVE_ACTIONS[keyof typeof MOVE_ACTIONS];

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
    const onDiedInteraction = this.actions.get('onDied');
    if (onDiedInteraction != null) battle.addAction(BATTLE_FINAL_ACTIONS.PLAYER_DIED, onDiedInteraction);
    battle.addAction(BATTLE_FINAL_ACTIONS.PLAYER_WIN, nextInteraction);
    return battle;
  }

  private async doBattle(player: AbstractActor, enemies: AbstractActor[]): Promise<boolean> {
    const battle = new BattleInteraction({ ui: this.ui, player, enemies });
    const onDiedInteraction = this.actions.get('onDied');
    if (onDiedInteraction != null) battle.addAction(BATTLE_FINAL_ACTIONS.PLAYER_DIED, onDiedInteraction);
    await battle.interact();

    return player.isAlive;
  }

  public async activate(): Promise<string> {
    const ruinAreaMap = new AreaMap(map, mapSize, additionalMapInfo);

    const player = this.state.player as Player;

    const nullInteraction = new Interaction({ ui: this.ui, async activate() { return null; }})

    await this.ui.sendToUser(`Привет ${this.state.additionalInfo.playerName}.\n`
      + `${player.getType({ declension: 'nominative', capitalised: true })} очнулся посреди руин.\n`
      + `${player.getType({ declension: 'nominative', capitalised: true })} не знаешь кто ты, где ты, зачем ты и что вообще произошло.\n`,
      'default',
    );

    const isTrue = true;

    const actions: Set<ACTION_VALUES> = new Set([ACTIONS.LOOK_AROUND, ACTIONS.STAND_UP]);
    const localActions: Set<MOVE_ACTION_VALUES | SITUATIONAL_ACTION_VALUES> = new Set();

    const internalPlayerState = {
      isStandUp: false,
      seeRatCorpse: async () => { /* pass */ },
    };

    while (isTrue) {
      // await this.ui.sendToUser(`Что будешь делать?\n`, 'default');

      const choosedAction = await this.ui.interactWithUser('Что будешь делать?', [...actions, ...localActions]);
      if (choosedAction === ACTIONS.LOOK_AROUND && !internalPlayerState.isStandUp) {
        actions.add(ACTIONS.LOOK_AT_YOURSELF);
        await this.ui.sendToUser(`Сумрачно.`
          + ` ${player.getType({ declension: 'nominative', capitalised: true })} сидишь опёршись на уцелевший угол стены.`
          + ` Над ${player.getType({ declension: 'ablative' })} есть небольшой кусок крыши. Рядом почти потухший костер.`
          + ` Поодаль везде грязь и лужи. Моросит мелкий дождик.\n`,
          'default',
        );
      } else if (choosedAction === ACTIONS.LOOK_AROUND && internalPlayerState.isStandUp) {
        ruinAreaMap.lookAround();
        await this.ui.sendToUser(ruinAreaMap.printMap(), 'default');
      } else if (choosedAction === ACTIONS.LOOK_AT_YOURSELF) {
        const stats = player.stats;
        // TODO: Сделать для вещей нормальный текст отображения!
        await this.ui.sendToUser(`${player.getType({ declension: 'possessive', capitalised: true })} характеристики:\n`
          + `  ❤️Очки здоровья - ${stats.healthPoints} / ${stats.maxHealthPoints}\n`
          + `  🛡Защита - ${stats.armor}\n`
          + `  🗡Сила удара - ${stats.attackDamage}\n`
          + `  🎯Шанс попасть ударом - ${stats.accuracy}\n`
          + `  ‼️Шанс попасть в уязвимое место - ${stats.criticalChance}\n`
          + `  ✖️Модификатор критического урона - ${stats.criticalDamageModifier}\n`
          + `  💰В кармане звенят ${player.gold} золота\n`
          + `\nНа ${player.getType({ declension: 'dative' })} надеты:\n`
          + ((): string => {
              const equipment = [];
              if (player.wearingEquipment.body != null) equipment.push(`  ${capitalise(player.wearingEquipment.body.name)}`);
              if (player.wearingEquipment.legs != null) equipment.push(`  ${capitalise(player.wearingEquipment.legs.name)}`);

              return equipment.join('\n');
            })()
          + `\nОружие - ${ player.wearingEquipment.rightHand?.name ?? 'ничего'}.\n`
          ,
          'default',
        );
      } else if (choosedAction === ACTIONS.STAND_UP) {
        internalPlayerState.isStandUp = true;
        actions.delete(ACTIONS.STAND_UP);
      } else if (choosedAction.startsWith('Идти на')) {

        if (choosedAction === MOVE_ACTIONS.TO_WEST) ruinAreaMap.move('WEST');
        else if (choosedAction === MOVE_ACTIONS.TO_EAST) ruinAreaMap.move('EAST');
        else if (choosedAction === MOVE_ACTIONS.TO_NORTH) ruinAreaMap.move('NORTH');
        else if (choosedAction === MOVE_ACTIONS.TO_SOUTH) ruinAreaMap.move('SOUTH');

        localActions.clear();

        const currentSpot = ruinAreaMap.currentSpot;

        if (currentSpot == null) { console.error('Oops, something went wrong!'); }
        
        else if (currentSpot.type === 'BAG') {
          const info = ruinAreaMap.currentSpot?.additionalInfo;
          if (info != null && info.reward === KnifeWeapon) {
            await this.ui.sendToUser(`Внезапно, ${player.getType({ declension: 'nominative' })} спотыкаешься о труп крысы.`, 'default');
            localActions.add(SITUATIONAL_ACTIONS.EXAMINE_CORPSE);
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
          localActions.add(SITUATIONAL_ACTIONS.TALK_WITH_MERCHANT);
        
        } else if (currentSpot.type === 'VERY_EASY_BATTLE') {
          const enemies = [new Rat({ typePostfix: '№1' })];

          if (!(await this.doBattle(player, enemies))) return RUIN_LOCATION_ACTIONS.PLAYER_DIED;

          ruinAreaMap.updateSpot(ruinAreaMap.playerPosition, 'CLEAN');
          await this.ui.sendToUser('Больше тут ничего и никого нет.', 'default');
        
        } else if (currentSpot.type === 'EASY_BATTLE') {
          const enemies = [new Rat({ typePostfix: '№1' }), new Rat({ typePostfix: '№2' })];

          if (!(await this.doBattle(player, enemies))) return RUIN_LOCATION_ACTIONS.PLAYER_DIED;

          ruinAreaMap.updateSpot(ruinAreaMap.playerPosition, 'CLEAN');
          await this.ui.sendToUser('Больше тут ничего и никого нет.', 'default');
        
        } else if (currentSpot.type === 'MEDIUM_BATTLE') {
          const enemies = [
            new Rat({ typePostfix: '№1' }),
            new Rat({ typePostfix: '№2' }),
            new Rat({ typePostfix: '№3' }),
          ];

          if (!(await this.doBattle(player, enemies))) return RUIN_LOCATION_ACTIONS.PLAYER_DIED;

          ruinAreaMap.updateSpot(ruinAreaMap.playerPosition, 'CLEAN');
          await this.ui.sendToUser('Больше тут ничего и никого нет.', 'default');
        
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
          await this.ui.sendToUser('Больше тут ничего и никого нет.', 'default');
        
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
          await this.ui.sendToUser('Больше тут ничего и никого нет.', 'default');
        
        } else if (currentSpot.type === 'GOLD') {
          await this.ui.sendToUser(`${player.getType({ declension: 'nominative', capitalised: true })} замечаешь некоторое количество золота под ногами.`, 'default');
          localActions.add(SITUATIONAL_ACTIONS.PICK_UP_GOLD);
        
        } else if (currentSpot.type === 'EXIT') {
          await this.ui.sendToUser(`${player.getType({ declension: 'nominative', capitalised: true })} идешь по импровизированному коридору из обломков стен.\n`
            + `По мере твоего продвижения вперед, воздух становится чище и свежее.\n`
            + `Похоже, ${player.getType({ declension: 'nominative' })} выбрался...\n`
            + `Еще через некоторое время продвижения, ${player.getType({ declension: 'nominative' })} видишь конец коридора и человека с повозкой возле него.`,
            'clean',
          );
          break;
        }
      } else if (choosedAction === SITUATIONAL_ACTIONS.TALK_WITH_MERCHANT) {
        const merchantGoods = new Set([
          {
            name: 'healthPoitions',
            action: 'Купить 1 зелье здоровья (10 золтых)',
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
        await this.ui.sendToUser(`${player.getType({ declension: 'nominative', capitalised: true })} подбираешь ${reward} золота.`, 'default');

      } else if (choosedAction === SITUATIONAL_ACTIONS.EXAMINE_CORPSE) {
        localActions.delete(SITUATIONAL_ACTIONS.EXAMINE_CORPSE);
        ruinAreaMap.updateSpot(ruinAreaMap.playerPosition, 'CLEAN');
        await internalPlayerState.seeRatCorpse();
      }

      if (internalPlayerState.isStandUp) {
        if (ruinAreaMap.canMove({ x: ruinAreaMap.playerPosition.x - 1, y: ruinAreaMap.playerPosition.y })) {
          localActions.add(MOVE_ACTIONS.TO_WEST);
        }
        if (ruinAreaMap.canMove({ x: ruinAreaMap.playerPosition.x + 1, y: ruinAreaMap.playerPosition.y })) {
          localActions.add(MOVE_ACTIONS.TO_EAST);
        }
        if (ruinAreaMap.canMove({ x: ruinAreaMap.playerPosition.x, y: ruinAreaMap.playerPosition.y - 1 })) {
          localActions.add(MOVE_ACTIONS.TO_NORTH);
        }
        if (ruinAreaMap.canMove({ x: ruinAreaMap.playerPosition.x, y: ruinAreaMap.playerPosition.y + 1 })) {
          localActions.add(MOVE_ACTIONS.TO_SOUTH);
        }
      }
    }

    return super.activate('Куда теперь?');
  }
}
