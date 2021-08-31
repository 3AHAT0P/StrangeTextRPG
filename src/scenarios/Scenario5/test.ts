import { HealthPotion } from '@actors/potions';
import { Rat } from '@actors/Rat';
import { BattleModel, InteractionModel, OneOFNodeModel } from '@db/entities';
import { ActionModel } from '@db/entities/Action';
import { BattleDifficulty } from '@db/entities/Battle';
import { MOVE_ACTIONS } from '@locations/AreaMap';
import { ActionsLayout } from '@ui';
import { Template } from '@utils/Template';
import logger from '@utils/Logger';

import { AbstractScenario, interactWithBattle, processActions } from '../AbstractScenario';

import { MerchantProduct, ScenarioContext } from './@types';
import { buildScenarioEvent as buildScenarioEvent1 } from './events/1';

const merchantGoods = new Map<number, Set<MerchantProduct>>();
merchantGoods.set(1, new Set([
  {
    internalName: 'healthPoitions',
    displayName: 'Зелье лечения',
    price: 10,
    item: new HealthPotion(),
  },
]));

const defaultGoods: Set<MerchantProduct> = new Set<MerchantProduct>();

const findActionByTextRaw = (
  actions: ActionModel[], value: string,
): ActionModel | null => actions.find(({ text }) => text.isEqualToRaw(value)) ?? null;

const getGoldCount = (difficult: BattleDifficulty): number => {
  if (difficult === 'VERY_EASY') return 8;
  if (difficult === 'EASY') return 12;
  if (difficult === 'MEDIUM') return 16;
  if (difficult === 'HARD') return 21;
  if (difficult === 'VERY_HARD') return 26;
  return 0;
};

const buildActionsBlock = (actions: ActionModel[], context: ScenarioContext): ActionsLayout<string> => {
  const groupedActions: {
    moveToNorth: string;
    moveToWest: string;
    moveToEast: string;
    moveToSouth: string;
    other: string[];
  } = {
    moveToNorth: MOVE_ACTIONS.NO_WAY,
    moveToWest: MOVE_ACTIONS.NO_WAY,
    moveToEast: MOVE_ACTIONS.NO_WAY,
    moveToSouth: MOVE_ACTIONS.NO_WAY,
    other: [],
  };

  for (const action of actions) {
    if (action.text.isEqualToRaw(MOVE_ACTIONS.TO_NORTH)) groupedActions.moveToNorth = MOVE_ACTIONS.TO_NORTH;
    else if (action.text.isEqualToRaw(MOVE_ACTIONS.TO_WEST)) groupedActions.moveToWest = MOVE_ACTIONS.TO_WEST;
    else if (action.text.isEqualToRaw(MOVE_ACTIONS.TO_EAST)) groupedActions.moveToEast = MOVE_ACTIONS.TO_EAST;
    else if (action.text.isEqualToRaw(MOVE_ACTIONS.TO_SOUTH)) groupedActions.moveToSouth = MOVE_ACTIONS.TO_SOUTH;
    else {
      groupedActions.other.push(action.text.useContext(context).value);
    }
  }

  const layout = new ActionsLayout();
  layout.addRow(
    '❓ Справка',
    `${groupedActions.moveToNorth} На Север`,
    '🗺 Карта',
  );
  layout.addRow(
    `${groupedActions.moveToWest} На Запад`,
    '🎒 Инвентарь',
    `${groupedActions.moveToEast} На Восток`,
  );
  layout.addRow(
    '🛏 Отдохнуть',
    `${groupedActions.moveToSouth} На Юг`,
    '⚙️ Меню',
  );

  let prevActionText: string | null = null;
  for (const actionText of groupedActions.other) {
    if (prevActionText === null) prevActionText = actionText;
    else {
      layout.addRow(prevActionText, actionText);
      prevActionText = null;
    }
  }

  if (prevActionText !== null) layout.addRow(prevActionText);

  return layout;
};

export class ScenarioNo5Test extends AbstractScenario {
  protected _scenarioId: number = 10001;

  protected _context: ScenarioContext | null = null;

  protected async _runner(): Promise<void> {
    if (this._context === null) throw new Error('Context is null');

    try {
      if (this.currentNode instanceof InteractionModel) {
        await this._sendTemplateToUser(this.currentNode.text, this._context);
      }

      if (this.currentNode instanceof BattleModel) {
        const goldReward = getGoldCount(this.currentNode.difficult);
        this.currentNode = await interactWithBattle(
          this._state.ui,
          this._cursor,
          this._state.player,
          [new Rat()],
        );
        this._state.player.inventory.collectGold(goldReward);
        return;
      }

      const processedActions = processActions(await this._cursor.getActions(), this._context);

      if (processedActions.auto != null) {
        processedActions.auto.operation?.useContext(this._context)?.forceBuild();
        this.currentNode = await this._cursor.getNextNode(processedActions.auto);
        return;
      }

      if (processedActions.system.length > 0) {
        const onDealSuccessAction = findActionByTextRaw(processedActions.system, 'OnDealSuccess');
        const onDealFailureAction = findActionByTextRaw(processedActions.system, 'OnDealFailure');
        if (onDealSuccessAction !== null && onDealFailureAction !== null) {
          this.currentNode = await this._buyOrLeaveInteract(
            onDealSuccessAction, onDealFailureAction, processedActions.custom,
          );
          return;
        }
        throw new Error('Unprocessed system actions found');
      }

      const choosedAction = await this._interactWithUser(processedActions.custom, this._context);
      if (choosedAction.text.isEqualToRaw(MOVE_ACTIONS.NO_WAY)) return;

      await this._sendTransitionMessage(choosedAction);
      this.currentNode = await this._cursor.getNextNode(choosedAction);
    } catch (error) {
      logger.error('ScenarioNo5Test::_runner', error);
    }
  }

  private async _buyOrLeaveInteract(
    onDealSuccessAction: ActionModel,
    onDealFailureAction: ActionModel,
    otherActions: ActionModel[],
  ): Promise<OneOFNodeModel> {
    const goodArray = this._context?.currentMerchant.goods ?? [];

    const actionText = await this._state.ui.interactWithUser(
      new ActionsLayout()
        .addRow(...goodArray.map(({ displayName }) => `Купить ${displayName} (1шт)`))
        .addRow(...otherActions.map(({ text }) => text.useContext(this._context).value)),
    );

    const choosedGood = goodArray.find(({ displayName }) => `Купить ${displayName} (1шт)` === actionText) ?? null;

    if (choosedGood === null) {
      const choosedAction = otherActions.find(({ text }) => text.isEqualTo(actionText));
      if (choosedAction == null) throw new Error('choosedGood and choosedAction is undefined');

      if (choosedAction.isPrintable) await this._sendTemplateToUser(choosedAction.text, this._context);

      return await this._cursor.getNextNode(choosedAction);
    }

    const exchangeResult = this._state
      .player.exchangeGoldToItem(choosedGood.price, [choosedGood.item]);
    if (exchangeResult) {
      await this._sendTemplateToUser(
        new Template(`⚙️ {{actorType player declension="nominative" capitalised=true}} купил ${choosedGood.displayName.toLowerCase()}`),
        this._context,
      );
      return await this._cursor.getNextNode(onDealSuccessAction);
    }

    return await this._cursor.getNextNode(onDealFailureAction);
  }

  private async _sendTransitionMessage(action: ActionModel): Promise<void> {
    if (action.text.isEqualToRaw(MOVE_ACTIONS.TO_NORTH)) await this._state.ui.sendToUser('Ты идешь на север');
    if (action.text.isEqualToRaw(MOVE_ACTIONS.TO_SOUTH)) await this._state.ui.sendToUser('Ты идешь на юг');
    if (action.text.isEqualToRaw(MOVE_ACTIONS.TO_WEST)) await this._state.ui.sendToUser('Ты идешь на запад');
    if (action.text.isEqualToRaw(MOVE_ACTIONS.TO_EAST)) await this._state.ui.sendToUser('Ты идешь на восток');
  }

  public async init() {
    await super.init();

    this._context = {
      additionalInfo: this._state.additionalInfo,
      player: this._state.player,
      events: {},
      battles: {},
      loadMerchantGoods: (menrchantId: number): void => {
        if (this._context !== null) {
          this._context.currentMerchant.goods = Array.from(merchantGoods.get(menrchantId) ?? defaultGoods);
        }
      },
      currentMerchant: {
        goods: [],
      },
    };

    this._context.events[1] = buildScenarioEvent1(this._context);
  }
}
