import { Player } from '@actors';
import { AbstractItem } from '@actors/AbstractItem';
import { HealthPotion } from '@actors/potions';
import { InteractionModel, NPCModel } from '@db/entities';
import { ActionsLayout } from '@ui';
import { filterBy } from '@utils/ArrayUtils';
import { Template } from '@utils/Template';
import { AbstractScenario, findActionBySubtype } from './AbstractScenario';

interface MerchantProduct {
  internalName: string;
  displayName: string;
  price: number;
  item: AbstractItem;
}

const merchantGoods = new Map<number, Set<MerchantProduct>>();
merchantGoods.set(1, new Set([
  {
    internalName: 'healthPoitions',
    displayName: 'Зелье лечения',
    price: 10,
    item: new HealthPotion(),
  },
]));

export class DemoMerchantScenario extends AbstractScenario {
  protected _scenarioId: number = 902;

  private _goods: Set<MerchantProduct> = new Set<MerchantProduct>();

  private _player: Player = new Player();

  protected async _runner(): Promise<void> {
    if (this.currentNode instanceof NPCModel) {
      this._goods = merchantGoods.get(this.currentNode.NPCId) ?? this._goods;
    }

    const templateContext = {
      goods: this._goods,
      player: this._player,
    };

    if (this.currentNode instanceof InteractionModel) {
      await this._sendTemplateToUser(this.currentNode.text, templateContext);
    }

    const actions = await this._cursor.getActions();

    if (actions.length === 1 && actions[0].type === 'AUTO') {
      this.currentNode = await this._cursor.getNextNode(actions[0]);

      return;
    }

    const onDealSuccessAction = findActionBySubtype(actions, 'DEAL_SUCCESS');
    const onDealFailureAction = findActionBySubtype(actions, 'DEAL_FAILURE');

    if (onDealSuccessAction !== null && onDealFailureAction !== null) {
      // buy
      const goodArray = Array.from(this._goods);
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

        return;
      }

      const exchangeResult = this._player.exchangeGoldToItem(choosedGood.price, [choosedGood.item]);
      if (exchangeResult) {
        await this._sendTemplateToUser(
          new Template(`⚙️ {{actorType player declension="nominative" capitalised=true}} купил ${choosedGood.displayName.toLowerCase()}`),
          templateContext,
        );
        this.currentNode = await this._cursor.getNextNode(onDealSuccessAction);
      } else this.currentNode = await this._cursor.getNextNode(onDealFailureAction);

      return;
    }

    const choosedAction = await this._interactWithUser(actions, templateContext);
    this.currentNode = await this._cursor.getNextNode(choosedAction);
  }

  public async init() {
    await super.init();

    this._player.inventory.collectGold(23);
  }
}
