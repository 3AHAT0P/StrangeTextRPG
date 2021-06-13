import { Cursor } from '@db/Cursor';
import { OneOFNodeModel, InteractionModel } from '@db/entities';
import { ActionsLayout } from '@ui';
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

  protected async _runner() {
    if (this.currentNode == null) {
      console.log('AbstractScenario::_runner', 'currentNode is null');
      return;
    }

    if (this.currentNode instanceof InteractionModel) await this._state.ui.sendToUser(this.currentNode.text);

    const actions = await this._cursor.getActions();
    if (actions.length === 1 && actions[0].type === 'AUTO') {
      this.currentNode = await this._cursor.getNextNode(actions[0]);
    } else {
      const actionText = await this._state.ui.interactWithUser(
        new ActionsLayout().addRow(...actions.map((action) => action.text)),
      );

      const choosedAction = actions.find((action) => action.text === actionText);

      if (choosedAction == null) throw new Error('choosedAction is null');
      this.currentNode = await this._cursor.getNextNode(choosedAction);
    }

    this._runNextIteration();
  }

  protected _runNextIteration() {
    if (this.currentNode == null) {
      console.log('AbstractScenario::_runNextIteration', 'currentNode is null');
      return;
    }
    if (this.currentNode.scenarioId !== this._scenarioId) {
      this._callbacks.onChangeScenario(this.currentNode.scenarioId);
    } else setTimeout(this._runner, 16);
  }

  constructor(cursor: Cursor, state: SessionState, callbacks: ScenarioCallbacks) {
    this._cursor = cursor;
    this._state = state;
    this._callbacks = callbacks;

    this._runner = this._runner.bind(this);
  }

  public async init() {
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

  public run() {
    this.currentNode = this._cursor.getNode();
    void this._runner();
  }
}
