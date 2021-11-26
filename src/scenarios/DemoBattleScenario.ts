import { Player, Rat } from '@actors';
import { KnifeWeapon } from '@actors/weapon';
import { InteractionModel } from '@db/entities';
import { safeGet, throwTextFnCarried } from '@utils';
import { BaseScenarioContext, ScenarioWithBattlesContext } from './@types';
import { AbstractScenario } from './AbstractScenario';
import { Battle } from './utils/Battle';
import { findActionBySubtype } from './utils/findActionBySubtype';

export class DemoBattleScenario extends AbstractScenario<BaseScenarioContext & ScenarioWithBattlesContext> {
  protected _scenarioId: number = 901;

  private async _doBattle(): Promise<void> {
    const player = new Player();
    player.equipWeapon(new KnifeWeapon());

    const enemies = [new Rat({ typePostfix: '№1' }), new Rat({ typePostfix: '№2' })];

    const battleInteraction = new Battle({
      ui: this._state.ui,
      player,
      enemies,
    });

    const actionType = await battleInteraction.activate();
    const action = safeGet(
      findActionBySubtype((await this.processedActions).all, actionType),
      throwTextFnCarried('Action type is wrong'),
    );
    this.context.currentStatus = 'DEFAULT';
    await this._updateCurrentNode(action, this.context);
  }

  protected _buildContext(): BaseScenarioContext & ScenarioWithBattlesContext {
    return {
      additionalInfo: this._state.additionalInfo,
      player: this._state.player,
      currentStatus: 'DEFAULT',
      battles: {},
    };
  }

  protected async _runner(): Promise<void> {
    if (this.currentNode instanceof InteractionModel) await this._sendTemplateToUser(this.currentNode.text);

    if (this.context.currentStatus === 'BATTLE') {
      await this._doBattle();
      return;
    }

    const processedActions = await this.processedActions;

    if (processedActions.auto != null) {
      await this._updateCurrentNode(processedActions.auto, this.context);
      return;
    }

    const choosedAction = await this._interactWithUser(processedActions.custom, this.context);
    await this._updateCurrentNode(choosedAction, this.context);
  }
}
