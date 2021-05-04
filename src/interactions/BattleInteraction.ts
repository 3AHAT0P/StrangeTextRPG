import { AbstractUI } from "../ui/AbstractUI";
import { AbstractActor, AttackResult } from "../actors/AbstractActor";
import { SimpleInteraction } from './SimpleInteraction';
import { AbstractInteraction, Interactable } from "./AbstractInteraction";

export interface BattleInteractionOptions {
  player: AbstractActor,
  enemies: AbstractActor[],
}

const ACTIONS = {
  attack: 'Атаковать 🗡',
  examine: 'Осмотреть 👀',
  useHealthPoition: 'Использовать зелье лечения',
  back: 'Назад',
};

export class BattleInteraction extends AbstractInteraction {
  private _player: AbstractActor;
  private _enemies: AbstractActor[];
  private _aliveEnemies: AbstractActor[];

  constructor(ui: AbstractUI, options: BattleInteractionOptions) {
    super(ui);

    this._player = options.player;
    this._enemies = options.enemies;
    this._aliveEnemies = this._enemies.filter((enemy) => enemy.isAlive);
  }

  public buildMessage(): string {
    throw new Error('Method not implemented');
  }

  public buildAttackMessage(attacker: AbstractActor, attacked: AbstractActor, attackResult: AttackResult): string {
    let message = `${attacker.getType({ declension: 'nominative', withPostfix: true, capitalised: true })} нанес`
      + ` ${attacked.getType({ declension: 'dative', withPostfix: true, capitalised: true })} ${attackResult.damage}.`;
    if (attackResult.isCritical)
      message += ` ‼️КРИТ`;
    if (attackResult.isMiss)
      message += ` ⚠️Промах`;
    message += '\n';
    return message;
  }

  public async activate(): Promise<Interactable> {
    if (this._aliveEnemies.length > 0) {
      await this.ui.sendToUser(
        `${this._player.getType({ declension: 'nominative', capitalised: true })}`
        + ` встретил ${this._enemies.length} ${this._enemies[0].getType({ declension: 'genitive', plural: this._enemies.length > 1 })}.`
        + ` Они все хотят кушать, а ты выглядишь очень аппетитно.\n`,
        'default'
      );
    }

    while (this._aliveEnemies.length > 0) {
      const message = 'Что будешь делать?\n';

      const actions = new Set([ACTIONS.attack, ACTIONS.examine]);

      if (this._player.healthPoitions > 0) actions.add(ACTIONS.useHealthPoition);

      const choosedAction = await this.ui.interactWithUser(message, [...actions]);
      if (choosedAction === ACTIONS.useHealthPoition) {
        const healVolume = this._player.useHealthPoition();
        if (healVolume) await this.ui.sendToUser('❤️' + `${this._player.getType({ declension: 'nominative' })} вылечился на ${healVolume} ОЗ. Всего у тебя ${this._player.stats.healthPoints} из ${this._player.stats.maxHealthPoints} ОЗ`, 'default');
      
      } else if (choosedAction === ACTIONS.examine) {
        const examineActions = this._aliveEnemies.map((enemy) => {
          return `Осмотреть ${enemy.getType({ declension: 'accusative', withPostfix: true })}`;
        });
        const choosedExamineAction = await this.ui.interactWithUser('Кого?', examineActions.concat([ACTIONS.back]));
        if (choosedExamineAction == ACTIONS.back) continue;
        const actionId = examineActions.indexOf(choosedExamineAction);
        const enemy = this._aliveEnemies[actionId];
        const enemyStats = enemy.stats;
        this.ui.sendToUser(`Xарактеристики ${enemy.getType({ declension: 'genitive', withPostfix: true })}:\n`
          + `  ❤️Очки здоровья - ${enemyStats.healthPoints} / ${enemyStats.maxHealthPoints}\n`
          + `  🛡Защита - ${enemyStats.armor}\n`
          + `  🗡Сила удара - ${enemyStats.attackDamage}\n`
          + `  🎯Шанс попасть ударом - ${enemyStats.accuracy}\n`
          + `  ‼️Шанс попасть в уязвимое место - ${enemyStats.criticalChance}\n`
          + `  ✖️Модификатор критического урона - ${enemyStats.criticalDamageModifier}\n`
          ,
          'default',
        );
      
      } else if (choosedAction === ACTIONS.attack) {
        const attackActions = this._aliveEnemies.map((enemy) => {
          return `Атаковать ${enemy.getType({ declension: 'accusative', withPostfix: true })}`;
        });
        const choosedAttackAction = await this.ui.interactWithUser('Кого?', attackActions.concat([ACTIONS.back]));
        if (choosedAttackAction == ACTIONS.back) continue;

        const actionId = attackActions.indexOf(choosedAttackAction);

        const attackedEnemy = this._aliveEnemies[actionId];
        const attackResult = this._player.doAttack(attackedEnemy);

        await this.ui.sendToUser(this.buildAttackMessage(this._player, attackedEnemy, attackResult), 'damageDealt');

        if (!attackResult.isAlive) {
          const diedEnemy = this._aliveEnemies[actionId];
          this._aliveEnemies.splice(actionId, 1);
          const reward = diedEnemy.getReward();
          this._player.collectReward(reward);
          await this.ui.sendToUser(
            `${diedEnemy.getDeathMessage()} ${this._player.getType({ declension: 'nominative' })} получил ${reward.gold ?? 0} золота.`,
            'default',
          );
        }
      }

      const enemiesAttack = this._aliveEnemies.map((actor: AbstractActor) => {
        return this.buildAttackMessage(actor, this._player, actor.doAttack(this._player));
      }).join('');
      if (enemiesAttack !== '') await this.ui.sendToUser(enemiesAttack, 'damageTaken');

      let roundResultMessage = '⚔️Результаты раунда:\n';
      roundResultMessage += ` - У ${this._player.getType({ declension: 'genitive' })} ${this._player.stats.healthPoints} ОЗ;\n`;
      roundResultMessage += this._aliveEnemies.map((actor: AbstractActor) => {
        return ` - У ${actor.getType({ declension: 'genitive', withPostfix: true })} ${actor.stats.healthPoints} ОЗ;\n`;
      }).join('');
      await this.ui.sendToUser(roundResultMessage, 'stats');

      if (!this._player.isAlive) {
        await this.ui.sendToUser(`Умер. Совсем. Окончательно.\n`, 'default');
        const onDiedInteraction = this.actions.get('onDied');
        if (onDiedInteraction != null) return onDiedInteraction;
        break;
      }
    }

    const onWinInteractions = this.actions.get('onWin');
    if (onWinInteractions != null) return onWinInteractions;

    const autoInteractions = this.actions.get('auto');
    if (autoInteractions != null) return autoInteractions;

    return new SimpleInteraction(this.ui, { message: 'Продолжение следует...\n' });
  }

}
