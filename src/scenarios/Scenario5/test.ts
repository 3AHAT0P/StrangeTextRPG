import { HealthPotion } from '@actors/potions';
import { Rat } from '@actors/Rat';
import { BattleModel, InteractionModel } from '@db/entities';
import { ActionModel } from '@db/entities/Action';
import { BattleDifficulty } from '@db/entities/Battle';
import { BattleInteraction, BATTLE_FINAL_ACTIONS } from '@interactions/BattleInteraction';
import { Interaction } from '@interactions/Interaction';
import { MOVE_ACTIONS } from '@locations/AreaMap';
import { ActionsLayout } from '@ui';
import { filterBy } from '@utils/ArrayUtils';
import { Template } from '@utils/Template';
import { AbstractScenario } from '../AbstractScenario';
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

export class ScenarioNoTest extends AbstractScenario {
  protected _scenarioId: number = 10001;

  protected _context: ScenarioContext | null = null;

  protected async _runner() {
    if (this._context === null) throw new Error('Context is null');

    try {
      if (this.currentNode instanceof InteractionModel) {
        await this._sendTemplateToUser(this.currentNode.text, this._context);
      }

      if (this.currentNode instanceof BattleModel) {
        if (await this._interactWithBattle(this.currentNode)) return;
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
      } else if (actions.some(({ type }) => type === 'SYSTEM')) {
        const onDealSuccessAction = findActionByTextRaw(actions, 'OnDealSuccess');
        const onDealFailureAction = findActionByTextRaw(actions, 'OnDealFailure');
        if (onDealSuccessAction !== null && onDealFailureAction !== null) {
          const needReturn = await this._buyOrLeaveInteract(
            onDealSuccessAction, onDealFailureAction, filterBy(actions, 'type', 'CUSTOM'),
          );
          if (needReturn) return;
        }
      } else {
        const userActions = actions.filter(({ type }) => type !== 'SYSTEM');
        const choosedAction = await this._interactWithUser(userActions, this._context);
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

  private async _buyOrLeaveInteract(
    onDealSuccessAction: ActionModel,
    onDealFailureAction: ActionModel,
    otherActions: ActionModel[],
  ): Promise<boolean> {
    // buy
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
      this.currentNode = await this._cursor.getNextNode(choosedAction);

      return true;
    }

    const exchangeResult = this._state
      .player.exchangeGoldToItem(choosedGood.price, [choosedGood.item]);
    if (exchangeResult) {
      await this._sendTemplateToUser(
        new Template(`⚙️ {{actorType player declension="nominative" capitalised=true}} купил ${choosedGood.displayName.toLowerCase()}`),
        this._context,
      );
      this.currentNode = await this._cursor.getNextNode(onDealSuccessAction);
    } else this.currentNode = await this._cursor.getNextNode(onDealFailureAction);

    return true;
  }

  private async _interactWithBattle(node: BattleModel): Promise<boolean> {
    const getGoldCount = (difficult: BattleDifficulty): number => {
      if (difficult === 'VERY_EASY') return 3;
      if (difficult === 'EASY') return 8;
      if (difficult === 'MEDIUM') return 13;
      if (difficult === 'HARD') return 18;
      if (difficult === 'VERY_HARD') return 25;
      return 0;
    };
    // const enemies = [new Rat({ typePostfix: '№1' }), new Rat({ typePostfix: '№2' })];
    const enemies = [new Rat()];
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
      this._state.player.inventory.collectGold(getGoldCount(node.difficult));
      await this._state.ui.sendToUser('Ты победил, молодец!');

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
