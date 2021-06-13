import { InteractionModel } from '@db/entities';
import { ActionsLayout } from '@ui';
import { AbstractScenario } from './AbstractScenario';

export class IntroScenario extends AbstractScenario {
  protected _scenarioId: number = 0;

  protected async _runner() {
    if (this.currentNode == null) {
      console.log('AbstractScenario::_runner', 'currentNode is null');
      return;
    }

    if (this.currentNode instanceof InteractionModel) {
      if (this.currentNode.interactionId === 3) {
        this._callbacks.onExit();
        return;
      }
      await this._state.ui.sendToUser(this.currentNode.text);
    }

    const actions = await this._cursor.getActions();
    if (actions.length === 1 && actions[0].type === 'AUTO') {
      this.currentNode = await this._cursor.getNextNode(actions[0]);
    } else {
      const actionText = await this._state.ui.interactWithUser(
        new ActionsLayout().addRow(...actions.map((action) => action.text)),
      );

      const choosedAction = actions.find((action) => action.text === actionText);

      if (choosedAction == null) throw new Error('choosedAction is null');
      this.currentNode = await this._cursor.getNextNode(choosedAction);
    }

    this._runNextIteration();
  }
}
