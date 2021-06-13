import { Player, Rat } from '@actors';
import { BattleModel, InteractionModel } from '@db/entities';
import { BattleInteraction, BATTLE_FINAL_ACTIONS, Interaction } from '@interactions';
import { ActionsLayout } from '@ui';
import { AbstractScenario } from './AbstractScenario';

export class DemoBattleScenario extends AbstractScenario {
  protected _scenarioId: number = 901;

  protected async _runner() {
    if (this.currentNode == null) {
      console.log('AbstractScenario::_runner', 'currentNode is null');
      return;
    }

    if (this.currentNode instanceof InteractionModel) await this._state.ui.sendToUser(this.currentNode.text);
    if (this.currentNode instanceof BattleModel) {
      const player = new Player();
      const enemies = [new Rat({ typePostfix: '№1' }), new Rat({ typePostfix: '№2' })];
      const battleInteraction = new BattleInteraction({ ui: this._state.ui, player, enemies });

      const winInteraction = new Interaction({
        ui: this._state.ui,
        async activate() {
          return null;
        },
      });
      const loseInteraction = new Interaction({
        ui: this._state.ui,
        async activate() {
          return null;
        },
      });

      battleInteraction.addSystemAction(BATTLE_FINAL_ACTIONS.PLAYER_WIN, winInteraction);
      battleInteraction.addSystemAction(BATTLE_FINAL_ACTIONS.PLAYER_DIED, loseInteraction);
      const nextInteraction = await battleInteraction.interact();
      const actions = await this._cursor.getActions();

      if (nextInteraction === winInteraction) {
        const winAction = actions.find((action) => action.text === 'OnWin');
        if (winAction == null) throw new Error('winAction is null');
        this.currentNode = await this._cursor.getNextNode(winAction);
      } else if (nextInteraction === loseInteraction) {
        const loseAction = actions.find((action) => action.text === 'OnWin');
        if (loseAction == null) throw new Error('loseAction is null');
        this.currentNode = await this._cursor.getNextNode(loseAction);
      } else throw new Error('Something went wrong!');
      this._runNextIteration();
      return;
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
