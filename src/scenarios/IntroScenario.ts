import { InteractionModel } from '@db/entities';
import { ActionsLayout } from '@ui';
import { AbstractScenario } from './AbstractScenario';

export class IntroScenario extends AbstractScenario {
  protected _scenarioId: number = 0;

  protected async _runner() {
    if (this.currentNode instanceof InteractionModel) {
      if (this.currentNode.interactionId === 3) {
        this._callbacks.onExit();
        return;
      }
      await this._sendTemplateToUser(this.currentNode.text);
    }

    const actions = await this._cursor.getActions();
    if (actions.length === 1 && actions[0].type === 'AUTO') {
      this.currentNode = await this._cursor.getNextNode(actions[0]);
    } else {
      const choosedAction = await this._interactWithUser(actions);
      this.currentNode = await this._cursor.getNextNode(choosedAction);
    }
  }
}
