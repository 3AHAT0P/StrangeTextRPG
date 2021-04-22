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
    let message = `${capitalise(attacker.getTypeByDeclensionOfNoun('nominative'))} нанес`
      + ` ${capitalise(attacked.getTypeByDeclensionOfNoun('dative'))} ${attackResult.damage}.`;
    if (attackResult.isCritical)
      message += ` **КРИТИЧЕСКИЙ УРОН**`;
    if (attackResult.isMiss)
      message += ` Промах.`;
    if (!attackResult.isAlive)
      message += ` ${attacked.getDeathMessage()}`;
    message += '\n';
    return message;
  }

  public async activate(): Promise<AbstractInteraction> {

    this.ui.sendToUser(
      `${capitalise(this._player.getTypeByDeclensionOfNoun('nominative'))}`
      + ` встретил ${this._enemies.length}х ${this._enemies[0].getTypeByDeclensionOfNoun('genitive', true)}.`
      + ` Они все хотят кушать, а ты выглядишь очень аппетитно.\n`,
      'default'
    );

    while (this._aliveEnemies.length > 0) {
      this.ui.sendToUser('Что будешь делать?\n', 'default');

      this._aliveEnemies.forEach((enemy, index) => {
        this.ui.sendToUser(`АТАКОВАТЬ ${enemy.getTypeByDeclensionOfNoun('accusative')} №${index + 1}\n`, 'option');
      });

      let optionId: number | null = null;
      while (optionId == null) {
        try {
          const userChoise = await this.ui.waitInteraction();
          if (userChoise > 0 && userChoise <= this._aliveEnemies.length)
            optionId = userChoise;
        } catch (error) {
          // pass
        }
      }

      const attackedEnemy = this._aliveEnemies[optionId - 1];
      const attackResult = this._player.doAttack(attackedEnemy);

      this.ui.sendToUser(this.buildAttackMessage(this._player, attackedEnemy, attackResult), 'damageDealt');

      if (!attackResult.isAlive)
        this._aliveEnemies.splice(optionId - 1, 1);

      this._aliveEnemies.forEach((actor: AbstractActor) => {
        const attackResult = actor.doAttack(this._player);
        this.ui.sendToUser(this.buildAttackMessage(actor, this._player, attackResult), 'damageTaken');
      });

      this.ui.sendToUser('Результаты раунда:\n', 'default');
      this.ui.sendToUser(`У ${this._player.getTypeByDeclensionOfNoun('genitive')} ${this._player.healthPoints} ОЗ;\n`, 'stats');
      this._aliveEnemies.forEach((actor: AbstractActor) => {
        this.ui.sendToUser(`У ${actor.getTypeByDeclensionOfNoun('genitive')} ${actor.healthPoints} ОЗ;\n`, 'stats');
      });

      if (!this._player.isAlive) {
        this.ui.sendToUser(`Умер. Совсем. Окончательно.\n`, 'default');
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
