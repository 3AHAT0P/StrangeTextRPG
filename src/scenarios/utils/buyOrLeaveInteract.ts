import { SmallHealingPotion } from '@actors/potions';
import { ActionModel } from '@db/entities';
import { BaseScenarioContext, ScenarioWithMerchantsContext } from '@scenarios/@types';
import { AbstractUI } from '@ui/@types';
import { Template } from '@utils/Template';
import { safeGet, throwTextFnCarried } from '@utils';
import { ActionSubtype } from '@db/entities/Action';

export const buyOrLeaveInteract = async <T extends BaseScenarioContext & ScenarioWithMerchantsContext>(
  context: T, ui: AbstractUI,
  otherActions: ActionModel[],
): Promise<'DEAL_SUCCESS' | 'DEAL_FAILURE' | ActionSubtype> => {
  const merchant = context.currentMerchant;

  if (merchant == null) throw new Error('Merchant is null');

  const goodArray = merchant.showcase;

  const actSelector = ui.createUserActSelector('BASE');

  for (let i = 0; i < goodArray.length; i += 1) {
    actSelector.addAction(`Купить ${goodArray[i].name}`, `BUY_${i}`, Math.trunc(i / 2));
  }

  for (let i = 0; i < otherActions.length; i += 1) {
    const { text, subtype } = otherActions[i];
    actSelector.addAction(text.useContext(context).value, subtype, Math.trunc(goodArray.length / 2 + 1 + i / 2));
  }

  const [actionType] = await actSelector.show();

  if (!actionType.startsWith('BUY_')) return actionType;

  const choosedGood = safeGet(
    goodArray[Number(actionType.split('_')[1])],
    throwTextFnCarried('Action type is wrong'),
  );

  const playerExchangeResult = context.player.exchangeGoldToItem(choosedGood.price, [choosedGood]);

  if (!playerExchangeResult) return 'DEAL_FAILURE';

  const merchantExchangeResult = merchant.exchangeItemToGold(choosedGood.price, choosedGood);
  if (!merchantExchangeResult) {
    context.player.exchangeItemToGold(choosedGood.price, choosedGood);
    return 'DEAL_FAILURE';
  }

  await ui.sendToUser(
    new Template(
      `⚙️ {{actorType player declension="nominative" capitalised=true}} купил ${choosedGood.name} x1.\n`
      + `Всего в инвентаре ${choosedGood.name} ${context.player.inventory.getItemsByClass(SmallHealingPotion).length}`,
    ).useContext(context).value,
  );
  return 'DEAL_SUCCESS';
};
