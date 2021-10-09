import { SmallHealingPotion } from '@actors/potions';
import { ActionModel } from '@db/entities';
import { BaseScenarioContext, ScenarioWithMerchantsContext } from '@scenarios/@types';
import { ActionsLayout, AbstractUI } from '@ui';
import { Template } from '@utils/Template';

export const buyOrLeaveInteract = async <T extends BaseScenarioContext & ScenarioWithMerchantsContext>(
  context: T, ui: AbstractUI,
  onDealSuccessAction: ActionModel,
  onDealFailureAction: ActionModel,
  otherActions: ActionModel[],
): Promise<ActionModel> => {
  const merchant = context.currentMerchant;

  if (merchant == null) throw new Error('Merchant is null');

  const goodArray = merchant.showcase;

  const actionText = await ui.interactWithUser(
    new ActionsLayout()
      .addRow(...goodArray.map(({ name }) => `Купить ${name}`))
      .addRow(...otherActions.map(({ text }) => text.useContext(context).value)),
  );

  const choosedGood = goodArray.find(({ name }) => `Купить ${name}` === actionText) ?? null;

  if (choosedGood === null) {
    const choosedAction = otherActions.find(({ text }) => text.isEqualTo(actionText));
    if (choosedAction == null) throw new Error('choosedGood and choosedAction is undefined');

    return choosedAction;
  }

  const playerExchangeResult = context.player.exchangeGoldToItem(choosedGood.price, [choosedGood]);

  if (!playerExchangeResult) return onDealFailureAction;

  const merchantExchangeResult = merchant.exchangeItemToGold(choosedGood.price, choosedGood);
  if (!merchantExchangeResult) {
    context.player.exchangeItemToGold(choosedGood.price, choosedGood);
    return onDealFailureAction;
  }

  await ui.sendToUser(
    new Template(
      `⚙️ {{actorType player declension="nominative" capitalised=true}} купил ${choosedGood.name} x1.\n`
      + `Всего в инвентаре ${choosedGood.name} ${context.player.inventory.getItemsByClass(SmallHealingPotion).length}`,
    ).useContext(context).value,
  );
  return onDealSuccessAction;
};
