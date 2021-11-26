import { InteractionModel } from '@db/entities';
import { BaseScenarioContext } from './@types';
import { AbstractScenario } from './AbstractScenario';
import { processActions } from './utils/processActions';

export class IntroScenario extends AbstractScenario<BaseScenarioContext> {
  protected _scenarioId: number = 0;

  protected _buildContext(): BaseScenarioContext {
    return {
      additionalInfo: this._state.additionalInfo,
      player: this._state.player,
      currentStatus: 'DEFAULT',
    };
  }

  protected async _runner(): Promise<void> {
    if (this.currentNode instanceof InteractionModel) {
      if (this.currentNode.interactionId === '3') {
        this._callbacks.onExit();
        return;
      }
      await this._sendTemplateToUser(this.currentNode.text);
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
