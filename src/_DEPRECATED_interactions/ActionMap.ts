import { WideMap } from '@utils/WideMap';
import type { AbstractInteraction } from './AbstractInteraction';

export type ActionType = 'SYSTEM' | 'AUTO' | 'CUSTOM';
type ActionMapColumns = [
  id: number, action: string, actionType: ActionType, showableText: string, interaction: AbstractInteraction,
];
export class ActionMap extends WideMap<ActionMapColumns> {
  protected _lastId: number = 0;

  protected actionTypeSecondaryIndex: Record<ActionType, ActionMapColumns[]> = {
    SYSTEM: [],
    AUTO: [],
    CUSTOM: [],
  };

  public generateId(): number { this._lastId += 1; return this._lastId; }

  public addRecord(
    id: ActionMapColumns[0],
    action: ActionMapColumns[1],
    actionType: ActionMapColumns[2],
    showableText: ActionMapColumns[3],
    interaction: ActionMapColumns[4],
  ): ActionMapColumns {
    const record = super.addRecord(id, action, actionType, showableText, interaction);
    this.actionTypeSecondaryIndex[actionType].push(record);
    return record;
  }

  public deleteRecord(id: ActionMapColumns[0]): ActionMapColumns | null {
    const record = super.deleteRecord(id);
    if (record != null) {
      const index = this.actionTypeSecondaryIndex[record[2]].findIndex(([_id]) => _id === id);
      this.actionTypeSecondaryIndex[record[2]].splice(index, 1);
    }
    return record;
  }

  public deleteRecordByAction(action: ActionMapColumns[1]): ActionMapColumns | null {
    const record = this.data.find(([, _action]) => _action === action);
    if (record == null) return null;

    return this.deleteRecord(record[0]);
  }

  public deleteRecordsByType(actionType: ActionType): void {
    for (const record of this.actionTypeSecondaryIndex[actionType]) {
      super.deleteRecord(record[0]);
    }
    this.actionTypeSecondaryIndex[actionType] = [];
  }

  public getActionsByType(actionType: ActionType): Array<ActionMapColumns[1]> {
    return this.actionTypeSecondaryIndex[actionType].map(([, action]) => action);
  }

  public getInteractionByAction(action: ActionMapColumns[1]): ActionMapColumns[4] | null {
    const record = this.data.find(([, _action]) => _action === action);
    if (record == null) return null;

    return record[4];
  }

  public getRecordByAction(action: ActionMapColumns[1]): ActionMapColumns | null {
    const record = this.data.find(([, _action]) => _action === action);
    if (record == null) return null;

    return record;
  }
}
