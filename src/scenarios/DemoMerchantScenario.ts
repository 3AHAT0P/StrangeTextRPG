/* eslint-disable max-classes-per-file */
import { AbstractActorOptions, Player } from '@actors';
import { AbstractItem } from '@actors/AbstractItem';
import { AbstractMerchant } from '@actors/AbstractMerchant';
import { SmallHealingPotion } from '@actors/potions';
import { ActionModel, InteractionModel } from '@db/entities';
import { ActionsLayout } from '@ui';
import logger from '@utils/Logger';
import { Template } from '@utils/Template';
import { BaseScenarioContext, ScenarioWithMerchantsContext } from './@types';
import { AbstractScenario, findActionBySubtype, processActions } from './AbstractScenario';

export class Merchant1 extends AbstractMerchant {
  protected readonly _id: `Scenario:${number}|Location:1|NPC:1` = `Scenario:${902}|Location:${1}|NPC:${1}`;

  protected readonly declensionOfNouns = <const>{
    nominative: 'Олаф',
    genitive: 'Олафа',
    dative: 'Олафу',
    accusative: 'Олафа',
    ablative: 'Олафом',
    prepositional: 'об Олафе',

    possessive: 'Олафа',
  };

  public readonly name = 'Олаф';

  public get showcase(): AbstractItem[] {
    return this.inventory.potions;
  }

  constructor(options: AbstractActorOptions = {}) {
    super(options);
    this.inventory.collectGold(200);
    for (let i = 0; i < 3; i += 1) {
      this.inventory.collectItem(new SmallHealingPotion());
    }
  }
}

export type DemoMerchantScenarioContext = BaseScenarioContext & ScenarioWithMerchantsContext;

export class DemoMerchantScenario extends AbstractScenario {
  protected _scenarioId: number = 902;

  private _player: Player = new Player();

  private _merchant: Merchant1 = new Merchant1();

  protected _context: DemoMerchantScenarioContext | null = null;

  protected async _runner(): Promise<void> {
    try {
      if (this.currentNode instanceof InteractionModel) {
        await this._sendTemplateToUser(this.currentNode.text, this.context);
      }

      const processedActions = processActions(await this._cursor.getActions(), this.context);

      if (processedActions.auto != null) {
        await this._updateCurrentNode(processedActions.auto, this.context);
        return;
      }

      if (processedActions.system.length > 0) {
        const onDealSuccessAction = findActionBySubtype(processedActions.system, 'DEAL_SUCCESS');
        const onDealFailureAction = findActionBySubtype(processedActions.system, 'DEAL_FAILURE');
        if (onDealSuccessAction !== null && onDealFailureAction !== null) {
          await this._buyOrLeaveInteract(
            this._context,
            onDealSuccessAction, onDealFailureAction, processedActions.custom,
          );
          return;
        }
        throw new Error('Unprocessed system actions found');
      }

      const choosedAction = await this._interactWithUser(processedActions.custom, this.context);
      await this._updateCurrentNode(choosedAction, this.context);
    } catch (error) {
      logger.error('DemoMerchantScenario::_runner', error);
    }
  }

  private async _buyOrLeaveInteract(
    context: DemoMerchantScenarioContext,
    onDealSuccessAction: ActionModel,
    onDealFailureAction: ActionModel,
    otherActions: ActionModel[],
  ): Promise<ActionModel> {
    const merchant = context.currentMerchant;

    if (merchant == null) throw new Error('Merchant is null');

    const goodArray = merchant.showcase;

    const actionText = await this._state.ui.interactWithUser(
      new ActionsLayout()
        .addRow(...goodArray.map(({ name }) => `Купить ${name}`))
        .addRow(...otherActions.map(({ text }) => text.useContext(context).value)),
    );

    const choosedGood = goodArray.find(({ name }) => `Купить ${name}` === actionText) ?? null;

    if (choosedGood === null) {
      const choosedAction = otherActions.find(({ text }) => text.isEqualTo(actionText));
      if (choosedAction == null) throw new Error('choosedGood and choosedAction is undefined');

      if (choosedAction.isPrintable) await this._sendTemplateToUser(choosedAction.text, context);

      return choosedAction;
    }

    const playerExchangeResult = context.player.exchangeGoldToItem(choosedGood.price, [choosedGood]);

    if (!playerExchangeResult) {
      return onDealFailureAction;
    }

    const merchantExchangeResult = merchant.exchangeItemToGold(choosedGood.price, choosedGood);
    if (!merchantExchangeResult) {
      context.player.exchangeItemToGold(choosedGood.price, choosedGood);
      return onDealFailureAction;
    }

    await this._sendTemplateToUser(
      new Template(
        `⚙️ {{actorType player declension="nominative" capitalised=true}} купил ${choosedGood.name} x1.\n`
        + `Всего в инвентаре ${choosedGood.name} ${context.player.inventory.getItemsByClass(SmallHealingPotion).length}`,
      ),
      context,
    );
    return onDealSuccessAction;
  }

  public async init(): Promise<void> {
    await super.init();

    this.context.loadMerchantInfo =  (): void => {
      this._context.currentMerchant = this._merchant;
    },
    unloadCurrentMerchant: (): void => {
      this._context.currentMerchant = null;
    },
    currentMerchant: null,
  }


    this._player.inventory.collectGold(23);
  }
}
