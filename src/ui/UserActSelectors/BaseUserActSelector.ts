import { ActionModel, ActionSubtype } from '@db/entities/Action';
import logger from '@utils/Logger';

import type { UserActSelectorAbstractAdapter } from '@ui/UserActSelectorAbstractAdapter';

export interface UserAction {
  id: number;
  text: string;
  type: ActionSubtype;
  originalAction: ActionModel | null;
  additionalData: any | null;
}

export const createUserAction = (
  id: number,
  text: string,
  type: ActionSubtype,
  originalAction: UserAction['originalAction'] = null,
  additionalData: UserAction['additionalData'] = null,
): UserAction => ({
  id, text, type, originalAction, additionalData,
});

export interface UserActSelectorOptions {
  adapter: UserActSelectorAbstractAdapter;
}

export class BaseUserActSelector {
  protected _adapter: UserActSelectorAbstractAdapter;

  protected _staticLayout: UserAction[][] = [[]];

  protected _dynamicLayout: UserAction[][] = [];

  protected get _layout(): UserAction[][] {
    return this._dynamicLayout.concat(this._staticLayout);
  }

  protected _idSequence: number = 1;

  constructor(options: UserActSelectorOptions) {
    this._adapter = options.adapter;
  }

  public addAction(
    text: string,
    type: ActionSubtype,
    rowIndex: number = 0,
    originalAction: UserAction['originalAction'] = null,
    additionalData: UserAction['additionalData'] = null,
  ): this {
    while (this._dynamicLayout.length <= rowIndex) this._dynamicLayout.push([]);
    this._dynamicLayout[rowIndex].push(createUserAction(this._idSequence, text, type, originalAction, additionalData));
    this._idSequence += 1;
    return this;
  }

  public clear(): void {
    this._staticLayout = [[]];
    this._dynamicLayout = [];
  }

  public reset(): void {
    this._dynamicLayout = [];
  }

  public setDynamicLayout(actions: ActionModel[]) {
    const layout: UserAction[][] = [];

    let index: number = 0;
    for (const action of actions) {
      layout[index] = [];
      layout[index].push(createUserAction(this._idSequence + index + 1, action.text.value, action.subtype, action));
      index += 1;
    }

    this._dynamicLayout = layout;
  }

  public async show<T = any>(): Promise<[ActionSubtype, UserAction['originalAction'], T]> {
    try {
      const actionId = await this._adapter.show(this._layout);
      const userAction = this._layout.flat(1).find(({ id }) => id === actionId);
      if (userAction != null) return [userAction.type, userAction.originalAction, userAction.additionalData];

      throw new Error('userAction is null');
    } catch (error) {
      logger.error('BaseUserActSelector::show', error);
      throw error;
    }
  }

  public hide(): Promise<boolean> {
    return this._adapter.hide();
  }
}
