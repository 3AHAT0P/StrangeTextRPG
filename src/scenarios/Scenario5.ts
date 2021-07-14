import { InteractionModel, NPCModel } from '@db/entities';
import { ActionModel } from '@db/entities/Action';
import { ActionsLayout } from '@ui';
import { filterBy, findBy } from '@utils/ArrayUtils';
import { Template } from '@utils/Template';
import { AbstractScenario } from './AbstractScenario';

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

  protected async _runner() {
    const context = {
      state: this._state,
      additionalInfo: this._state.additionalInfo,
      player: this._state.player,
      events: this._state.events,
    };
    try {
      if (this.currentNode instanceof InteractionModel) {
        await this._sendTemplateToUser(this.currentNode.text, context);
      }

      if (this.currentNode instanceof NPCModel) {
        if (this.currentNode.subtype === 'MERCHANT') {
          if (await this._interactWithMerchant(this.currentNode)) return;
        }
      }

      const actions = (await this._cursor.getActions())
        .filter((action) => {
          if (action.condition === null) return true;
          action.condition.useContext(context);
          return action.condition.value === 'true';
        });
      if (actions.length === 1 && actions[0].type === 'AUTO') {
        this.currentNode = await this._cursor.getNextNode(actions[0]);
      } else {
        if (actions.some((action) => action.type === 'AUTO')) {
          // @TODO: я хз че делать дальше
        }
        const choosedAction = await this._interactWithUser(actions, context);
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
}
