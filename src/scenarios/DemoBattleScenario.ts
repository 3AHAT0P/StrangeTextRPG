import { Player, Rat } from '@actors';
import { KnifeWeapon } from '@actors/weapon';
import { BattleModel, InteractionModel } from '@db/entities';
import { AbstractScenario, interactWithBattle } from './AbstractScenario';

export class DemoBattleScenario extends AbstractScenario {
  protected _scenarioId: number = 901;

  protected async _runner(): Promise<void> {
    if (this.currentNode instanceof InteractionModel) await this._sendTemplateToUser(this.currentNode.text);
    if (this.currentNode instanceof BattleModel) {
      const player = new Player();
      player.equipWeapon(new KnifeWeapon());
      this.currentNode = await interactWithBattle(
        this._state.ui,
        this._cursor,
        player,
        [new Rat({ typePostfix: '№1' }), new Rat({ typePostfix: '№2' })],
      );
      return;
    }

    const actions = await this._cursor.getActions();
    if (actions.length === 1 && actions[0].type === 'AUTO') {
      this.currentNode = await this._cursor.getNextNode(actions[0]);
    } else {
      const choosedAction = await this._interactWithUser(actions, {});
      this.currentNode = await this._cursor.getNextNode(choosedAction);
    }
  }
}
