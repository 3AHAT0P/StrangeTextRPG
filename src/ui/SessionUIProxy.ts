import {
  AbstractUI, AbstractSessionUI,
  StartTheGameCallback, FinishTheGameCallback,
} from './@types';

import { BaseUserActSelector } from './UserActSelectors/BaseUserActSelector';
import { UserActSelectorType } from './UserActSelectors/UserActSelectorManager';

export class SessionUIProxy implements AbstractUI {
  constructor(
    private readonly _baseUI: AbstractSessionUI,
    private readonly _sessionId: string,
  ) {}

  public init(runOnStart: StartTheGameCallback, runOnFinish: FinishTheGameCallback): this {
    this._baseUI.init(runOnStart, runOnFinish);
    return this;
  }

  public createUserActSelector(type: UserActSelectorType): BaseUserActSelector {
    return this._baseUI.createUserActSelector(this._sessionId, type);
  }

  public getUserActSelector(type: UserActSelectorType): BaseUserActSelector {
    return this._baseUI.getUserActSelector(this._sessionId, type);
  }

  public sendToUser(message: string, cleanAcions?: boolean): Promise<void> {
    return this._baseUI.sendToUser(this._sessionId, message, cleanAcions);
  }

  public closeSession(): Promise<void> {
    return this._baseUI.closeSession(this._sessionId);
  }

  public async onExit(...args: any[]): Promise<void> {
    return this._baseUI.onExit(args[0], args[1]);
  }
}
