import { AbstractUI } from "../ui/AbstractUI";
import { AbstractActor, AttackResult } from "../actors/AbstractActor";
import { SimpleInteraction } from './SimpleInteraction';
import { capitalise } from "../utils/capitalise";
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
    let message = `${capitalise(attacker.getTypeByDeclensionOfNoun({ declension: 'nominative', hasPostfix: true }))} нанес`
      + ` ${capitalise(attacked.getTypeByDeclensionOfNoun({ declension: 'dative', hasPostfix: true }))} ${attackResult.damage}.`;
    if (attackResult.isCritical)
      message += ` ‼️КРИТ`;
    if (attackResult.isMiss)
      message += ` ⚠️Промах`;
    if (!attackResult.isAlive)
      message += ` ${attacked.getDeathMessage()}`;
    message += '\n';
    return message;
  }

  public async activate(): Promise<AbstractInteraction> {
    await this.ui.sendToUser(
      `${capitalise(this._player.getTypeByDeclensionOfNoun({ declension: 'nominative' }))}`
      + ` встретил ${this._enemies.length}х ${this._enemies[0].getTypeByDeclensionOfNoun({ declension: 'genitive', plural: true })}.`
      + ` Они все хотят кушать, а ты выглядишь очень аппетитно.\n`,
      'default'
    );

    while (this._aliveEnemies.length > 0) {
      const message = 'Что будешь делать?\n';

      const options = this._aliveEnemies.map((enemy, index) => {
        return `АТАКОВАТЬ ${enemy.getTypeByDeclensionOfNoun({ declension: 'accusative', hasPostfix: true })}`;
      });

      const option = await this.ui.interactWithUser(message, options);
      const optionId = options.indexOf(option);

      const attackedEnemy = this._aliveEnemies[optionId];
      const attackResult = this._player.doAttack(attackedEnemy);

      await this.ui.sendToUser('🗡' + this.buildAttackMessage(this._player, attackedEnemy, attackResult), 'damageDealt');

      if (!attackResult.isAlive) this._aliveEnemies.splice(optionId, 1);

      const enemiesAttack = this._aliveEnemies.map((actor: AbstractActor) => {
        return '🩸' + this.buildAttackMessage(actor, this._player, actor.doAttack(this._player));
      }).join('');
      if (enemiesAttack !== '') await this.ui.sendToUser(enemiesAttack, 'damageTaken');

      let roundResultMessage = '⚔️Результаты раунда:\n';
      roundResultMessage += ` - У ${this._player.getTypeByDeclensionOfNoun({ declension: 'genitive' })} ${this._player.healthPoints} ОЗ;\n`;
      roundResultMessage += this._aliveEnemies.map((actor: AbstractActor) => {
        return ` - У ${actor.getTypeByDeclensionOfNoun({ declension: 'genitive', hasPostfix: true })} ${actor.healthPoints} ОЗ;\n`;
      }).join('');
      await this.ui.sendToUser(roundResultMessage, 'stats');

      if (!this._player.isAlive) {
        await this.ui.sendToUser(`Умер. Совсем. Окончательно.\n`, 'default');
        break;
      }
    }

    const autoInteractions = this.actions.get('auto');
    if (autoInteractions != null) {
      return autoInteractions;
    }

    return new SimpleInteraction(this.ui, { message: 'Продолжение следует...\n' });
  }

}
