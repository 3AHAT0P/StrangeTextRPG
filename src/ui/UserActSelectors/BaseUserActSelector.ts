import { ActionSubtype } from '@db/entities/Action';
import logger from '@utils/Logger';

import type { UserActSelectorAbstractAdapter } from '@ui/UserActSelectorAbstractAdapter';

export interface UserAction {
  id: number;
  text: string;
  type: ActionSubtype;
}

export interface UserActSelectorOptions {
  adapter: UserActSelectorAbstractAdapter;
}

export class BaseUserActSelector {
  protected _adapter: UserActSelectorAbstractAdapter;

  protected _layout: UserAction[][] = [[]];

  protected _idSequence: number = 1;

  constructor(options: UserActSelectorOptions) {
    this._adapter = options.adapter;
  }

  public addAction(text: string, type: ActionSubtype, rowIndex: number = 0): this {
    while (this._layout.length <= rowIndex) this._layout.push([]);
    this._layout[rowIndex].push({ id: this._idSequence, text, type });
    this._idSequence += 1;
    return this;
  }

  public async show(): Promise<ActionSubtype> {
    try {
      const actionId = await this._adapter.show(this._layout);
      const userAction = this._layout.flat(1).find(({ id }) => id === actionId);
      if (userAction != null) return userAction.type;

      throw new Error('userAction is null');
    } catch (error) {
      logger.error('BaseUserActSelector::show', error);
      throw error;
    }
  }

  hide(): Promise<boolean> {
    return this._adapter.hide();
  }
}
