import { Cursor } from '@db/Cursor';
import { OneOFNodeModel, InteractionModel } from '@db/entities';
import { ActionModel } from '@db/entities/Action';
import { ActionsLayout } from '@ui';
import { Template } from '@utils/Template';
import { SessionState } from 'SessionState';

interface ScenarioCallbacks {
  onChangeScenario: (scenarioId: number) => void;
  onExit: () => void;
}

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
      console.log('AbstractScenario::_beforeRun', 'currentNode is null');
      return false;
    }
    return true;
  }

  protected async _runner(): Promise<void> {
    if (this.currentNode instanceof InteractionModel) await this._sendTemplateToUser(this.currentNode.text);

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
      console.log('AbstractScenario::_afterRun', 'currentNode is null');
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
      if (node.scenarioId === this._scenarioId && node.locationId === 1) {
        this.currentNode = node;
        return;
      }
    }

    await this._cursor.init({ scenarioId: this._scenarioId, locationId: 1 });
    this.currentNode = this._cursor.getNode();
  }

  public run(): void {
    this.currentNode = this._cursor.getNode();
    void this._run();
  }
}
