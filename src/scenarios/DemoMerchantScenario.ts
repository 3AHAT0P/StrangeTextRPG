import { AbstractActor, Player, Rat, TypeByDeclensionOfNounOptions } from '@actors';
import { InteractionModel, NPCModel } from '@db/entities';
import { ActionModel } from '@db/entities/Action';
import { BattleInteraction, BATTLE_FINAL_ACTIONS, Interaction } from '@interactions';
import { GoodItem } from '@interactions/NPC/Merchant';
import { ActionsLayout } from '@ui';
import { list } from 'pm2';
import { AbstractScenario } from './AbstractScenario';

const merchantGoods = new Map<number, Set<GoodItem>>();
merchantGoods.set(1, new Set([
  {
    name: 'healthPoitions',
    message: 'Зелье лечения = 10 золотых (📀)',
    action: 'Купить зелье лечения',
    price: 10,
  },
]));

type Helper<TOptions extends any[]> = (this: void, options: TOptions) => string;

const printGoodList: Helper<[Set<GoodItem>]> = ([goods]) => (
  Array
    .from(goods.values())
    .map(({ message }, index) => `${index + 1}. ${message}`)
    .join('\n')
);

const actorType: Helper<[actor: AbstractActor, options: TypeByDeclensionOfNounOptions]> = (
  [actor, options],
) => actor.getType(options);

const get: Helper<[target: Record<string, unknown>, key: string]> = (
  [target, key],
) => Reflect.get(target, key).toString();

const helpers = {
  printGoodList,
  actorType,
  get,
};

const parse = (template: string, ctx: any): string => {
  const result = template.replace(/{{[^}]+}}/ig, (part: string, index: number, input: string): string => {
    const [helperName, ...params] = part.slice(2, -2).split(' ');

    if (!(helperName in helpers)) throw new Error(`Unexpected helper name ${helperName}`);
    const helper = helpers[helperName as keyof typeof helpers];

    const options = [];

    for (const param of params) {
      if (param.trim().startsWith('.')) {
        options.push(ctx[param.slice(1)]);
      } else if (param.trim().startsWith('(')) {
        const o: Record<string, any> = {};
        for (const objPart of param.slice(1, -1).split(', ')) {
          if (objPart.includes('=')) {
            const [key, value] = objPart.split('=');
            o[key.trim()] = value.trim();
          } else o[objPart] = true;
        }
      }
    }

    console.log('HELPER', helperName, helper, options, params)
    return helper(options as any);
  });

  return result;
};

type OnDealFailureAction = ActionModel & { text: 'OnDealFailure', type: 'SYSTEM' };
type OnDealSuccessAction = ActionModel & { text: 'OnDealSuccess', type: 'SYSTEM' };

const isDealActions = (actions: ActionModel[]):
  actions is [OnDealFailureAction, OnDealSuccessAction] | [OnDealSuccessAction, OnDealFailureAction] => {
  if (actions.length !== 2) return false;
  if (actions[0].type !== 'SYSTEM' || actions[1].type !== 'SYSTEM') return false;
  if (actions[0].text !== 'OnDealFailure' && actions[1].text !== 'OnDealFailure') return false;
  if (actions[0].text !== 'OnDealSuccess' && actions[1].text !== 'OnDealSuccess') return false;
  return true;
};

export class DemoMerchantScenario extends AbstractScenario {
  protected _scenarioId: number = 902;

  private _goods: Set<GoodItem> | null = null;

  private _player: Player = new Player();

  protected async _runner() {
    if (this.currentNode == null) {
      console.log('AbstractScenario::_runner', 'currentNode is null');
      return;
    }

    if (this.currentNode instanceof NPCModel) {
      this._goods = merchantGoods.get(this.currentNode.NPCId) ?? null;
    }
    if (this.currentNode instanceof InteractionModel) {
      const text = parse(this.currentNode.text, {
        goods: this._goods,
        player: this._player,
      });
      await this._state.ui.sendToUser(text);
    }

    const actions = await this._cursor.getActions();
    console.log('!!!!!!!!!!!!!!!!', this.currentNode, actions);
    if (actions.length === 1 && actions[0].type === 'AUTO') {
      this.currentNode = await this._cursor.getNextNode(actions[0]);
    } else if (isDealActions(actions)) {
      if (this._goods == null) throw new Error('Goods are null');
      // buy
      const actionText = await this._state.ui.interactWithUser(
        new ActionsLayout().addRow(...Array.from(this._goods).map(({ action }) => action)),
      );

      const choosedGood = Array.from(this._goods).find(({ action }) => action === actionText);

      if (choosedGood == null) throw new Error('choosedGood is undefined');

      const result = this._player.exchangeGoldToItem(choosedGood.price, { [choosedGood.name]: 1 });
      if (!result) {
        const failureAction = actions[0].text === 'OnDealFailure' ? actions[0] : actions[1];
        this.currentNode = await this._cursor.getNextNode(failureAction);
        return;
      }
      const successAction = actions[0].text === 'OnDealSuccess' ? actions[0] : actions[1];
      this.currentNode = await this._cursor.getNextNode(successAction);
      return;
    } else {
      const actionContainers = actions.map((action) => {
        const text = parse(action.text, {
          goods: this._goods,
          player: this._player,
        });
        return {
          action, text,
        };
      });
      const actionText = await this._state.ui.interactWithUser(
        new ActionsLayout().addRow(...actionContainers.map(({ text }) => text)),
      );

      const choosedAction = actionContainers.find((action) => action.text === actionText);

      if (choosedAction == null) throw new Error('choosedAction is null');
      this.currentNode = await this._cursor.getNextNode(choosedAction.action);
    }

    this._runNextIteration();
  }

  public async init() {
    await super.init();

    this._player.collectReward({ gold: 23 });
  }
}
