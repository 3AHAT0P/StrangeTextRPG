import { Cursor } from '@db/Cursor';
import { OneOFNodeModel, InteractionModel, BattleModel } from '@db/entities';
import { ActionModel } from '@db/entities/Action';
import { Template } from '@utils/Template';
import logger from '@utils/Logger';
import { safeGet, throwTextFnCarried } from '@utils';
import { SessionState } from 'SessionState';

import { BaseScenarioContext } from './@types';
import { processActions, ProcessedActions } from './utils/processActions';
import { Battle } from './utils/Battle';
import { findActionBySubtype } from './utils/findActionBySubtype';

export interface ScenarioCallbacks {
  onChangeScenario: (scenarioId: number) => void;
  onExit: () => void;
}

export abstract class AbstractScenario<TScenarioContext extends BaseScenarioContext> {
  protected _cursor: Cursor;

  protected _state: SessionState;

  protected _callbacks: ScenarioCallbacks;

  protected abstract _scenarioId: number;

  protected _context: TScenarioContext | null = null;

  protected get context(): TScenarioContext {
    if (this._context == null) throw new Error('context is null');
    return this._context;
  }

  protected get processedActions(): Promise<ProcessedActions> {
    return this._cursor.getActions().then((actions) => processActions(actions, this.context));
  }

  protected _userActSelectorId: string | null = null;

  protected currentNode: OneOFNodeModel | null = null;

  public get scenarioId(): number { return this._scenarioId; }

  private async _run(): Promise<void> {
    if (!(await this._beforeRun())) return;
    await this._runner();
    await this._afterRun();
  }

  protected abstract _buildContext(): TScenarioContext;

  protected async _updateCurrentNode(action: ActionModel, context: TScenarioContext): Promise<void> {
    if (action.isPrintable && action.text != null) await this._sendTemplateToUser(action.text, context);
    action.operation?.useContext(context)?.forceBuild();
    switch (action.subtype) {
      case 'BATTLE_START': {
        this.context.currentStatus = 'BATTLE';
        break;
      }
      case 'BATTLE_WIN':
      case 'BATTLE_LOSE':
      case 'BATTLE_LEAVE': {
        this.context.currentStatus = 'DEFAULT';
        break;
      }
      case 'DIALOG_START': {
        this.context.currentStatus = 'DIALOG';
        break;
      }
      case 'DIALOG_END': {
        this.context.currentStatus = 'DEFAULT';
        break;
      }
      case 'TRADE_START': {
        this.context.currentStatus = 'TRADING';
        break;
      }
      case 'TRADE_END': {
        this.context.currentStatus = 'DEFAULT';
        break;
      }
      default: {
        break;
      }
    }
    this.currentNode = await this._cursor.getNextNode(action);
  }

  protected async _beforeRun(): Promise<boolean> {
    if (this.currentNode == null) {
      logger.info('AbstractScenario::_beforeRun', 'currentNode is null');
      return false;
    }
    return true;
  }

  protected async _runner(): Promise<void> {
    if (this.currentNode instanceof InteractionModel) await this._sendTemplateToUser(this.currentNode.text);

    const actions = await this._cursor.getActions();

    if (this.currentNode instanceof BattleModel) {
      const battleInteraction = new Battle({
        ui: this._state.ui,
        player: this._state.player,
        enemies: [],
      });

      const actionType = await battleInteraction.activate();
      const action = safeGet(
        findActionBySubtype(actions, actionType),
        throwTextFnCarried('Action type is wrong'),
      );
      await this._updateCurrentNode(action, this.context);
      return;
    }

    const processedActions = processActions(await this._cursor.getActions(), this.context);

    if (processedActions.auto != null) {
      await this._updateCurrentNode(processedActions.auto, this.context);
      return;
    }

    const choosedAction = await this._interactWithUser(processedActions.custom, this.context);
    await this._updateCurrentNode(choosedAction, this.context);
  }

  protected async _afterRun(): Promise<void> {
    if (this.currentNode == null) {
      logger.info('AbstractScenario::_afterRun', 'currentNode is null');
      return;
    }

    if (!this._cursor.nodeIsEqual(this.currentNode)) {
      this._cursor.jumpToNode(this.currentNode); // I don't know. It could be (hypotetical) kostyl'
    }

    if (this.currentNode.scenarioId !== this._scenarioId) {
      this._callbacks.onChangeScenario(this.currentNode.scenarioId);
    } else setTimeout(this._run, 16);
  }

  protected async _sendTemplateToUser(template: Template, context: TScenarioContext = this.context): Promise<void> {
    await this._state.ui.sendToUser(template.useContext(context).value);
  }

  protected async _interactWithUser(
    actions: ActionModel[],
    context: TScenarioContext = this.context,
  ): Promise<ActionModel> {
    const actSelector = this._state.ui.createUserActSelector('BASE');

    let index: number = 0;
    for (const action of actions) {
      actSelector.addAction(action.text.useContext(context).value, action.subtype, Math.trunc(index / 3), action);
      index += 1;
    }

    const [, choosedAction] = await actSelector.show();

    if (choosedAction === null) throw new Error('choosedAction is null');

    return choosedAction;
  }

  constructor(cursor: Cursor, state: SessionState, callbacks: ScenarioCallbacks) {
    this._cursor = cursor;
    this._state = state;
    this._callbacks = callbacks;

    this._run = this._run.bind(this);
  }

  public async init(): Promise<void> {
    if (this._cursor.isInitiated) {
      const node = this._cursor.getNode();
      if (node.scenarioId === this._scenarioId) {
        this.currentNode = node;

        this._context = this._buildContext();
        return;
      }
    }

    await this._cursor.init({ scenarioId: this._scenarioId, locationId: 1, isStart: true });
    this.currentNode = this._cursor.getNode();

    this._context = this._buildContext();
  }

  public run(): void {
    this.currentNode = this._cursor.getNode();
    void this._run();
  }
}
