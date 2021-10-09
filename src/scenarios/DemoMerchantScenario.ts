/* eslint-disable max-classes-per-file */
import { AbstractActorOptions, Player } from '@actors';
import { AbstractItem } from '@actors/AbstractItem';
import { AbstractMerchant } from '@actors/AbstractMerchant';
import { SmallHealingPotion } from '@actors/potions';
import { InteractionModel } from '@db/entities';
import logger from '@utils/Logger';
import { BaseScenarioContext, ScenarioWithMerchantsContext } from './@types';
import { AbstractScenario } from './AbstractScenario';
import { buyOrLeaveInteract } from './utils/buyOrLeaveInteract';
import { findActionBySubtype } from './utils/findActionBySubtype';
import { processActions } from './utils/processActions';

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

export class DemoMerchantScenario extends AbstractScenario<DemoMerchantScenarioContext> {
  protected _scenarioId: number = 902;

  private _merchant: Merchant1 = new Merchant1();

  protected _buildContext(): DemoMerchantScenarioContext {
    return {
      additionalInfo: this._state.additionalInfo,
      player: new Player(),
      loadMerchantInfo: (): void => {
        this.context.currentMerchant = this._merchant;
      },
      unloadCurrentMerchant: (): void => {
        this.context.currentMerchant = null;
      },
      currentMerchant: null,
    };
  }

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
          const action = await buyOrLeaveInteract(
            this.context, this._state.ui,
            onDealSuccessAction, onDealFailureAction, processedActions.custom,
          );

          await this._updateCurrentNode(action, this.context);
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

  public async init(): Promise<void> {
    await super.init();

    this.context.player.inventory.collectGold(23);
  }
}
