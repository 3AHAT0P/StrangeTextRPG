import { Player, Rat } from '@actors';
import { KnifeWeapon } from '@actors/weapon';
import { BattleModel, InteractionModel } from '@db/entities';
import { BattleInteraction, BATTLE_FINAL_ACTIONS, Interaction } from '@interactions';
import { ActionsLayout } from '@ui';
import { AbstractScenario } from './AbstractScenario';

export class DemoBattleScenario extends AbstractScenario {
  protected _scenarioId: number = 901;

  protected async _runner() {
    if (this.currentNode instanceof InteractionModel) await this._sendTemplateToUser(this.currentNode.text);
    if (this.currentNode instanceof BattleModel) {
      const player = new Player();
      player.equipWeapon(new KnifeWeapon());
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
        const winAction = actions.find((action) => action.text.isEqualToRaw('OnWin'));
        if (winAction == null) throw new Error('winAction is null');
        this.currentNode = await this._cursor.getNextNode(winAction);
      } else if (nextInteraction === loseInteraction) {
        const loseAction = actions.find((action) => action.text.isEqualToRaw('OnLose'));
        if (loseAction == null) throw new Error('loseAction is null');
        this.currentNode = await this._cursor.getNextNode(loseAction);
      } else throw new Error('Something went wrong!');
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
