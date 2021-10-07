import { Cursor } from '@db/Cursor';
import { OneOFNodeModel, InteractionModel, BattleModel } from '@db/entities';
import { ActionModel, ActionSubtype } from '@db/entities/Action';
import { AbstractActor } from '@actors';
import { Battle, BATTLE_FINAL_ACTIONS } from '@interactions/Battle';
import { AbstractUI, ActionsLayout } from '@ui';
import { Template } from '@utils/Template';
import logger from '@utils/Logger';
import { SessionState } from 'SessionState';
import { BaseScenarioContext } from './@types';

export interface ScenarioCallbacks {
  onChangeScenario: (scenarioId: number) => void;
  onExit: () => void;
}

export const findActionBySubtype = (
  actions: ActionModel[], value: ActionSubtype,
): ActionModel | null => actions.find(({ subtype }) => subtype === value) ?? null;

export const interactWithBattle = async (
  ui: AbstractUI, cursor: Cursor,
  player: AbstractActor, enemies: AbstractActor[],
  forceReturnOnLeave: boolean = false,
): Promise<ActionModel | null> => {
  const battleInteraction = new Battle({ ui, player, enemies });

  const battleResult = await battleInteraction.activate();
  const actions = await cursor.getActions();

  if (battleResult === BATTLE_FINAL_ACTIONS.PLAYER_WIN) {
    const winAction = findActionBySubtype(actions, 'BATTLE_WIN');
    if (winAction == null) throw new Error('winAction is null');
    return winAction;
  }

  if (battleResult === BATTLE_FINAL_ACTIONS.PLAYER_DIED) {
    const loseAction = findActionBySubtype(actions, 'BATTLE_LOSE');
    if (loseAction == null) throw new Error('loseAction is null');
    return loseAction;
  }

  if (battleResult === BATTLE_FINAL_ACTIONS.LEAVE) {
    if (forceReturnOnLeave) return null;

    const leaveAction = findActionBySubtype(actions, 'BATTLE_LEAVE');
    if (leaveAction == null) throw new Error('leaveAction is null');
    return leaveAction;
  }

  throw new Error('Incorrect battle result');
};

export interface ProcessedActions {
  auto: ActionModel | null;
  system: ActionModel[];
  custom: ActionModel[];
}

export const processActions = (actions: ActionModel[], context: BaseScenarioContext): ProcessedActions => {
  const result: ProcessedActions = {
    auto: null,
    system: [],
    custom: [],
  };
  for (const action of actions) {
    if (action.condition !== null) {
      action.condition.useContext(context);
      if (!action.condition.isEqualTo('true')) continue;
    }

    if (action.type === 'AUTO') {
      result.auto = action;
      return result;
    }

    if (action.type === 'SYSTEM') {
      result.system.push(action);
    } else {
      result.custom.push(action);
    }
  }

  return result;
};

export abstract class AbstractScenario {
  protected _cursor: Cursor;

  protected _state: SessionState;

  protected _callbacks: ScenarioCallbacks;

  protected abstract _scenarioId: number;

  protected _context: BaseScenarioContext | null = null;

  protected get context(): this['_context'] {
    if (this._context == null) throw new Error('context is null');
    return this._context;
  }

  protected currentNode: OneOFNodeModel | null = null;

  public get scenarioId(): number { return this._scenarioId; }

  private async _run(): Promise<void> {
    if (!(await this._beforeRun())) return;
    await this._runner();
    await this._afterRun();
  }

  protected async _updateCurrentNode(action: ActionModel, context: BaseScenarioContext): Promise<void> {
    action.operation?.useContext(context)?.forceBuild();
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

    if (this.currentNode instanceof BattleModel) {
      const action = await interactWithBattle(
        this._state.ui,
        this._cursor,
        this._state.player,
        [],
      );
      if (action != null) {
        await this._updateCurrentNode(action, this.context);
        return;
      }

      throw new Error('Action is null');
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

  protected async _sendTemplateToUser(template: Template, context: any = this._state): Promise<void> {
    await this._state.ui.sendToUser(template.useContext(context).value);
  }

  protected async _interactWithUser(actions: ActionModel[], context: any = this._state): Promise<ActionModel> {
    const actionText = await this._state.ui.interactWithUser(
      new ActionsLayout().addRow(...actions.map(({ text }) => text.useContext(context).value)),
    );

    const choosedAction = actions.find(({ text }) => text.isEqualTo(actionText));

    if (choosedAction == null) throw new Error('choosedAction is null');
    if (choosedAction.isPrintable) await this._sendTemplateToUser(choosedAction.text, context);
    choosedAction.operation?.useContext(context)?.forceBuild();

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
        return;
      }
    }

    await this._cursor.init({ scenarioId: this._scenarioId, locationId: 1, isStart: true });
    this.currentNode = this._cursor.getNode();

    this._context = {
      additionalInfo: this._state.additionalInfo,
      player: this._state.player,
    };
  }

  public run(): void {
    this.currentNode = this._cursor.getNode();
    void this._run();
  }
}
