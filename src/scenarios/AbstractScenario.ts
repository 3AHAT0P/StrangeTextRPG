import { Cursor } from '@db/Cursor';
import { OneOFNodeModel, InteractionModel, BattleModel } from '@db/entities';
import { ActionModel, ActionSubtype } from '@db/entities/Action';
import { AbstractActor } from '@actors';
import { Battle, BATTLE_FINAL_ACTIONS } from '@interactions/Battle';
import { AbstractUI, ActionsLayout } from '@ui';
import { Template } from '@utils/Template';
import logger from '@utils/Logger';
import { SessionState } from 'SessionState';

export interface ScenarioCallbacks {
  onChangeScenario: (scenarioId: number) => void;
  onExit: () => void;
}

export const findActionBySubtype = (
  actions: ActionModel[], value: ActionSubtype,
): ActionModel | null => actions.find(({ subtype }) => subtype === value) ?? null;

export const interactWithBattle = async (
  ui: AbstractUI, cursor: Cursor, player: AbstractActor, enemies: AbstractActor[],
): Promise<OneOFNodeModel> => {
  const battleInteraction = new Battle({ ui, player, enemies });

  const battleResult = await battleInteraction.activate();
  const actions = await cursor.getActions();

  if (battleResult === BATTLE_FINAL_ACTIONS.PLAYER_WIN) {
    const winAction = findActionBySubtype(actions, 'BATTLE_WIN');
    if (winAction == null) throw new Error('winAction is null');
    return cursor.getNextNode(winAction);
  }

  if (battleResult === BATTLE_FINAL_ACTIONS.PLAYER_DIED) {
    const loseAction = findActionBySubtype(actions, 'BATTLE_LOSE');
    if (loseAction == null) throw new Error('loseAction is null');
    return cursor.getNextNode(loseAction);
  }

  throw new Error('Incorrect battle result');
};

export interface ProcessedActions {
  auto: ActionModel | null;
  system: ActionModel[];
  custom: ActionModel[];
}

export const processActions = (actions: ActionModel[], context: any): ProcessedActions => {
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

  protected currentNode: OneOFNodeModel | null = null;

  public get scenarioId(): number { return this._scenarioId; }

  private async _run(): Promise<void> {
    if (!(await this._beforeRun())) return;
    await this._runner();
    await this._afterRun();
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
      this.currentNode = await interactWithBattle(
        this._state.ui,
        this._cursor,
        this._state.player,
        [],
      );
      return;
    }

    const actions = await this._cursor.getActions();
    if (actions.length === 1 && actions[0].type === 'AUTO') {
      this.currentNode = await this._cursor.getNextNode(actions[0]);
    } else {
      const choosedAction = await this._interactWithUser(actions, {});
      this.currentNode = await this._cursor.getNextNode(choosedAction);
    }
  }

  protected async _afterRun(): Promise<void> {
    if (this.currentNode == null) {
      logger.info('AbstractScenario::_afterRun', 'currentNode is null');
      return;
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
  }

  public run(): void {
    this.currentNode = this._cursor.getNode();
    void this._run();
  }
}
