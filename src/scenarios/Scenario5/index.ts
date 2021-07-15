import { Rat } from '@actors/Rat';
import { BattleModel, InteractionModel, NPCModel } from '@db/entities';
import { ActionModel } from '@db/entities/Action';
import { BattleInteraction, BATTLE_FINAL_ACTIONS } from '@interactions/BattleInteraction';
import { Interaction } from '@interactions/Interaction';
import { MOVE_ACTIONS } from '@locations/AreaMap';
import { ActionsLayout, AdditionalSessionInfo } from '@ui';
import { filterBy, findBy } from '@utils/ArrayUtils';
import { Template } from '@utils/Template';
import { AbstractScenario } from '../AbstractScenario';
import { ScenarioContext } from './@types';
import { buildScenarioEvent as buildScenarioEvent1 } from './events/1';

interface MerchantProduct {
  internalName: string;
  displayName: string;
  price: number;
}

const merchantGoods = new Map<number, Set<MerchantProduct>>();
merchantGoods.set(1, new Set([
  {
    internalName: 'healthPoitions',
    displayName: 'Зелье лечения',
    price: 10,
  },
]));
merchantGoods.set(2, new Set([
  {
    internalName: 'healthPoitions',
    displayName: 'Зелье лечения',
    price: 10,
  },
]));
merchantGoods.set(3, new Set([
  {
    internalName: 'healthPoitions',
    displayName: 'Зелье лечения',
    price: 10,
  },
]));
merchantGoods.set(4, new Set([
  {
    internalName: 'healthPoitions',
    displayName: 'Зелье лечения',
    price: 10,
  },
]));
merchantGoods.set(5, new Set([
  {
    internalName: 'healthPoitions',
    displayName: 'Зелье лечения',
    price: 10,
  },
]));

const defaultGoods: Set<MerchantProduct> = new Set<MerchantProduct>();

const findActionByTextRaw = (
  actions: ActionModel[], value: string,
): ActionModel | null => actions.find(({ text }) => text.isEqualToRaw(value)) ?? null;

export class ScenarioNo5 extends AbstractScenario {
  protected _scenarioId: number = 5;

  protected _context: ScenarioContext | null = null;

  protected async _runner() {
    if (this._context === null) throw new Error('Context is null');
    console.log(this.currentNode);
    try {
      if (this.currentNode instanceof InteractionModel) {
        await this._sendTemplateToUser(this.currentNode.text, this._context);
      }

      if (this.currentNode instanceof NPCModel) {
        if (this.currentNode.subtype === 'MERCHANT') {
          if (await this._interactWithMerchant(this.currentNode)) return;
        }
      }

      if (this.currentNode instanceof BattleModel) {
        if (this.currentNode.chanceOfTriggering > Math.random()) {
          if (await this._interactWithBattle(this.currentNode)) return;
        }
      }

      const allActions = await this._cursor.getActions();
      const actions = allActions
        .filter((action) => {
          if (action.condition === null) return true;
          action.condition.useContext(this._context);
          return action.condition.isEqualTo('true');
        });
      const autoAction = actions.find((action) => action.type === 'AUTO');

      if (autoAction != null) {
        autoAction.operation?.useContext(this._context)?.forceBuild();
        this.currentNode = await this._cursor.getNextNode(autoAction);
      } else {
        const choosedAction = await this._interactWithUser(actions, this._context);
        if (choosedAction.text.isEqualToRaw(MOVE_ACTIONS.NO_WAY)) return;
        if (choosedAction.text.isEqualToRaw(MOVE_ACTIONS.TO_NORTH)) await this._state.ui.sendToUser('Ты идешь на север');
        if (choosedAction.text.isEqualToRaw(MOVE_ACTIONS.TO_SOUTH)) await this._state.ui.sendToUser('Ты идешь на юг');
        if (choosedAction.text.isEqualToRaw(MOVE_ACTIONS.TO_WEST)) await this._state.ui.sendToUser('Ты идешь на запад');
        if (choosedAction.text.isEqualToRaw(MOVE_ACTIONS.TO_EAST)) await this._state.ui.sendToUser('Ты идешь на восток');
        this.currentNode = await this._cursor.getNextNode(choosedAction);
      }
    } catch (error) {
      console.error('ScenarioNo5::_runner', error);
    }
  }

  private async _interactWithMerchant(node: NPCModel): Promise<boolean> {
    const actions = await this._cursor.getActions();
    const goods = merchantGoods.get(node.NPCId) ?? defaultGoods;
    const templateContext = { goods, player: this._state.player };

    if (actions.length === 1 && actions[0].type === 'AUTO') {
      this.currentNode = await this._cursor.getNextNode(actions[0]);

      return true;
    }

    const onDealSuccessAction = findActionByTextRaw(actions, 'OnDealSuccess');
    const onDealFailureAction = findActionByTextRaw(actions, 'OnDealFailure');

    if (onDealSuccessAction !== null && onDealFailureAction !== null) {
      // buy
      const goodArray = Array.from(goods);
      const otherActions = filterBy(actions, 'type', 'CUSTOM');

      const actionText = await this._state.ui.interactWithUser(
        new ActionsLayout()
          .addRow(...goodArray.map(({ displayName }) => `Купить ${displayName} (1шт)`))
          .addRow(...otherActions.map(({ text }) => text.useContext(templateContext).value)),
      );

      const choosedGood = goodArray.find(({ displayName }) => `Купить ${displayName} (1шт)` === actionText) ?? null;

      if (choosedGood === null) {
        const choosedAction = otherActions.find(({ text }) => text.isEqualTo(actionText));
        if (choosedAction == null) throw new Error('choosedGood and choosedAction is undefined');

        if (choosedAction.isPrintable) await this._sendTemplateToUser(choosedAction.text, templateContext);
        this.currentNode = await this._cursor.getNextNode(choosedAction);

        return true;
      }

      const exchangeResult = this._state
        .player.exchangeGoldToItem(choosedGood.price, { [choosedGood.internalName]: 1 });
      if (exchangeResult) {
        await this._sendTemplateToUser(
          new Template(`⚙️ {{actorType player declension="nominative" capitalised=true}} купил ${choosedGood.displayName.toLowerCase()}`),
          templateContext,
        );
        this.currentNode = await this._cursor.getNextNode(onDealSuccessAction);
      } else this.currentNode = await this._cursor.getNextNode(onDealFailureAction);

      return true;
    }
    return false;
  }

  private async _interactWithBattle(node: BattleModel): Promise<boolean> {
    console.log('BATTLE difficult', node.difficult);
    const enemies = [new Rat({ typePostfix: '№1' }), new Rat({ typePostfix: '№2' })];
    const battleInteraction = new BattleInteraction({ ui: this._state.ui, player: this._state.player, enemies });

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
    return true;
  }

  public async init() {
    await super.init();

    this._context = {
      additionalInfo: this._state.additionalInfo,
      player: this._state.player,
      events: { },
    };

    this._context.events[1] = buildScenarioEvent1(this._context);
  }
}
