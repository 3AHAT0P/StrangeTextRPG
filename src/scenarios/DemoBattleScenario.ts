import { Player, Rat } from '@actors';
import { KnifeWeapon } from '@actors/weapon';
import { BattleModel, InteractionModel } from '@db/entities';
import { safeGet, throwTextFnCarried } from '@utils';
import { BaseScenarioContext } from './@types';
import { AbstractScenario } from './AbstractScenario';
import { Battle } from './utils/Battle';
import { findActionBySubtype } from './utils/findActionBySubtype';
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

    const actions = await this._cursor.getActions();

    if (this.currentNode instanceof BattleModel) {
      const player = new Player();
      player.equipWeapon(new KnifeWeapon());

      const battleInteraction = new Battle({
        ui: this._state.ui,
        player,
        enemies: [new Rat({ typePostfix: '№1' }), new Rat({ typePostfix: '№2' })],
      });

      const actionType = await battleInteraction.activate();
      const action = safeGet(
        findActionBySubtype(actions, actionType),
        throwTextFnCarried('Action type is wrong'),
      );
      await this._updateCurrentNode(action, this.context);
      return;
    }

    const processedActions = processActions(actions, this.context);

    if (processedActions.auto != null) {
      await this._updateCurrentNode(processedActions.auto, this.context);
      return;
    }

    const choosedAction = await this._interactWithUser(processedActions.custom, this.context);
    await this._updateCurrentNode(choosedAction, this.context);
  }
}
