import { AbstractUI } from "../ui/AbstractUI";
import { AbstractActor, AttackResult } from "../actors/AbstractActor";
import { SimpleInteraction } from './SimpleInteraction';
import { AbstractInteraction } from "./AbstractInteraction";

export interface BattleInteractionOptions {
  player: AbstractActor,
  enemies: AbstractActor[],
}

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

  public async activate(): Promise<AbstractInteraction> {
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

      const options = this._aliveEnemies.map((enemy) => {
        return `АТАКОВАТЬ ${enemy.getType({ declension: 'accusative', withPostfix: true })}`;
      });

      if (this._player.healthPoitions > 0) options.push(`Использовать зелье лечения`);

      const option = await this.ui.interactWithUser(message, options);
      if (option === 'Использовать зелье лечения') {
        const healVolume = this._player.useHealthPoition();
        if (healVolume) await this.ui.sendToUser('❤️' + `${this._player.getType({ declension: 'nominative' })} вылечился на ${healVolume} ОЗ. Всего у тебя ${this._player.stats.healthPoints} из ${this._player.stats.maxHealthPoints} ОЗ`, 'default');
      } else {
        const optionId = options.indexOf(option);

        const attackedEnemy = this._aliveEnemies[optionId];
        const attackResult = this._player.doAttack(attackedEnemy);

        await this.ui.sendToUser('🗡' + this.buildAttackMessage(this._player, attackedEnemy, attackResult), 'damageDealt');

        if (!attackResult.isAlive) {
          const diedEnemy = this._aliveEnemies[optionId];
          this._aliveEnemies.splice(optionId, 1);
          const reward = diedEnemy.getReward();
          this._player.collectReward(reward);
          await this.ui.sendToUser(
            `${diedEnemy.getDeathMessage()} ${this._player.getType({ declension: 'nominative' })} получил ${reward.gold ?? 0} золота.`,
            'default',
          );
        }
      }

      const enemiesAttack = this._aliveEnemies.map((actor: AbstractActor) => {
        return '🩸' + this.buildAttackMessage(actor, this._player, actor.doAttack(this._player));
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
