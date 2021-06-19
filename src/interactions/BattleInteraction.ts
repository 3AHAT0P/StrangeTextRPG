/* eslint-disable no-await-in-loop */
import { AbstractActor, AttackResult } from '@actors/AbstractActor';
import { ActionsLayout } from '@ui/ActionsLayout';

import { AbstractInteraction, AbstractInteractionOptions } from './AbstractInteraction';

export interface BattleInteractionOptions extends AbstractInteractionOptions{
  player: AbstractActor,
  enemies: AbstractActor[],
}

const ACTIONS = {
  attack: 'Атаковать 🗡',
  examine: 'Осмотреть 👀',
  // useHealthPoition: 'Использовать зелье лечения',
  back: 'Назад',
} as const;

type ACTION_VALUES = typeof ACTIONS[keyof typeof ACTIONS];

export const BATTLE_FINAL_ACTIONS = {
  PLAYER_DIED: 'onDied',
  PLAYER_WIN: 'onWin',
} as const;

export class BattleInteraction extends AbstractInteraction {
  private _player: AbstractActor;

  private _enemies: AbstractActor[];

  private _aliveEnemies: AbstractActor[];

  constructor(options: BattleInteractionOptions) {
    super(options);

    this._player = options.player;
    this._enemies = options.enemies;
    this._aliveEnemies = this._enemies.filter((enemy) => enemy.isAlive);
  }

  protected buildFirstMessage(attacker: AbstractActor, attacked: AbstractActor[]): string {
    const message = `${attacker.getType({ declension: 'nominative', capitalised: true })}`
      + ` встретил ${attacked.length} ${attacked[0].getType({ declension: 'genitive', plural: attacked.length > 1 })}.`
      + ' Они все хотят кушать, а ты выглядишь очень аппетитно.\n';
    return message;
  }

  protected buildAttackMessage(attacker: AbstractActor, attacked: AbstractActor, attackResult: AttackResult): string {
    let message = `${attacker.getType({ declension: 'nominative', withPostfix: true, capitalised: true })} нанес`
      + ` ${attacked.getType({ declension: 'dative', withPostfix: true, capitalised: true })} ${attackResult.damage}.`;
    if (attackResult.isCritical) message += ' ‼️КРИТ';
    if (attackResult.isMiss) message += ' ⚠️Промах';
    message += '\n';
    return message;
  }

  protected battleFinished(): boolean {
    return this._aliveEnemies.length === 0 || !this._player.isAlive;
  }

  protected async activate(): Promise<string> {
    if (!this.battleFinished()) {
      await this.ui.sendToUser(this.buildFirstMessage(this._player, this._enemies));
    }

    let choosedAction: ACTION_VALUES | null = null;

    while (!this.battleFinished()) {
      const actions: Set<ACTION_VALUES> = new Set([ACTIONS.attack, ACTIONS.examine]);

      if (choosedAction === null) {
        choosedAction = await this.ui.interactWithUser(new ActionsLayout<ACTION_VALUES>().addRow(...actions));
      }

      if (choosedAction === ACTIONS.examine) {
        const examineActions = this._aliveEnemies.map((enemy) => `Осмотреть ${enemy.getType({ declension: 'accusative', withPostfix: true })}`);
        const choosedExamineAction = await this.ui.interactWithUser(
          new ActionsLayout().addRow(...examineActions.concat([ACTIONS.back])),
        );
        if (choosedExamineAction === ACTIONS.back) {
          choosedAction = null;
          continue;
        }
        const actionId = examineActions.indexOf(choosedExamineAction);
        const enemy = this._aliveEnemies[actionId];
        const enemyStats = enemy.stats;
        await this.ui.sendToUser(`${this._player.getType({ declension: 'nominative', capitalised: true })} осматриваешь ${enemy.getType({ declension: 'accusative', withPostfix: true })}.`);
        await this.ui.sendToUser('Xарактеристики:\n'
          + `  Очки здоровья(❤️) - ${enemyStats.healthPoints} / ${enemyStats.maxHealthPoints}\n`
          + `  Защита(🛡) - ${enemyStats.armor}\n`
          + `  Сила удара(🗡) - ${enemyStats.attackDamage}\n`
          + `  Шанс попасть ударом(🎯) - ${enemyStats.accuracy}\n`
          + `  Шанс попасть в уязвимое место(‼️) - ${enemyStats.criticalChance}\n`
          + `  Модификатор критического урона(✖️) - ${enemyStats.criticalDamageModifier}\n`);
      } else if (choosedAction === ACTIONS.attack) {
        const attackActions = this._aliveEnemies.map((enemy) => `Атаковать ${enemy.getType({ declension: 'accusative', withPostfix: true })}`);
        const choosedAttackAction = await this.ui.interactWithUser(
          new ActionsLayout().addRow(...attackActions.concat([ACTIONS.back])),
        );
        if (choosedAttackAction === ACTIONS.back) {
          choosedAction = null;
          continue;
        }

        const actionId = attackActions.indexOf(choosedAttackAction);

        const attackedEnemy = this._aliveEnemies[actionId];
        const attackResult = this._player.doAttack(attackedEnemy);

        await this.ui.sendToUser(this.buildAttackMessage(this._player, attackedEnemy, attackResult));

        for (const aliveEnemy of this._aliveEnemies.slice()) {
          if (!aliveEnemy.isAlive) {
            const index = this._aliveEnemies.indexOf(aliveEnemy);
            if (index < 0) continue;
            this._aliveEnemies.splice(index, 1);
            const rewardMessage = aliveEnemy.getReward(this._player);
            await this.ui.sendToUser(`${aliveEnemy.getDeathMessage()}.`);
            await this.ui.sendToUser(rewardMessage);
          }
        }
      }

      const enemiesAttack = this._aliveEnemies.map(
        (actor: AbstractActor) => this.buildAttackMessage(actor, this._player, actor.doAttack(this._player)),
      ).join('');
      if (enemiesAttack !== '') await this.ui.sendToUser(enemiesAttack);

      let roundResultMessage = '⚔️Результаты раунда:\n';
      roundResultMessage += ` - У ${this._player.getType({ declension: 'genitive' })} ${this._player.stats.healthPoints} ОЗ;\n`;
      roundResultMessage += this._aliveEnemies.map((actor: AbstractActor) => ` - У ${actor.getType({ declension: 'genitive', withPostfix: true })} ${actor.stats.healthPoints} ОЗ;\n`).join('');
      await this.ui.sendToUser(roundResultMessage);

      if (!this._player.isAlive) {
        await this.ui.sendToUser('Умер. Совсем. Окончательно.\n');
        return BATTLE_FINAL_ACTIONS.PLAYER_DIED;
      }
    }

    return BATTLE_FINAL_ACTIONS.PLAYER_WIN;
  }
}
