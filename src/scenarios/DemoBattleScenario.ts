import { Player, Rat } from '@actors';
import { KnifeWeapon } from '@actors/weapon';
import { BattleModel, InteractionModel } from '@db/entities';
import { BaseScenarioContext } from './@types';
import { AbstractScenario } from './AbstractScenario';
import { interactWithBattle } from './utils/interactWithBattle';
import { processActions } from './utils/processActions';

export class DemoBattleScenario extends AbstractScenario<BaseScenarioContext> {
  protected _scenarioId: number = 901;

  protected _buildContext(): BaseScenarioContext {
    return {
      additionalInfo: this._state.additionalInfo,
      player: this._state.player,
    };
  }

  protected async _runner(): Promise<void> {
    if (this.currentNode instanceof InteractionModel) await this._sendTemplateToUser(this.currentNode.text);
    if (this.currentNode instanceof BattleModel) {
      const player = new Player();
      player.equipWeapon(new KnifeWeapon());
      const action = await interactWithBattle(
        this._state.ui,
        this._cursor,
        player,
        [new Rat({ typePostfix: '№1' }), new Rat({ typePostfix: '№2' })],
      );

      if (action != null) {
        await this._updateCurrentNode(action, this.context);
        return;
      }

      throw new Error('Action is null');
    }

    const processedActions = processActions(await this._cursor.getActions(), this.context);

    if (processedActions.auto != null) {
      await this._updateCurrentNode(processedActions.auto, this.context);
      return;
    }

    const choosedAction = await this._interactWithUser(processedActions.custom, this.context);
    await this._updateCurrentNode(choosedAction, this.context);
  }
}
