import { AbstractUI } from './AbstractUI';
import type { AbstractSessionUI } from './AbstractSessionUI';
import { ActionsLayout } from './ActionsLayout';
import { PersistActionsContainer } from './utils';

export class SessionUIProxy extends AbstractUI {
  constructor(private readonly _baseUI: AbstractSessionUI, private readonly _sessionId: string) {
    super();
  }

  public sendToUser(message: string, cleanAcions?: boolean): Promise<void> {
    return this._baseUI.sendToUser(this._sessionId, message, cleanAcions);
  }

  public interactWithUser<T extends string>(
    actions: ActionsLayout<T>, validate: (action: T) => boolean,
  ): Promise<T> {
    return this._baseUI.interactWithUser(this._sessionId, actions, validate);
  }

  public showPersistentActions<T extends string>(
    message: string, actions: ActionsLayout<T>, actionsListener: (action: T) => void,
  ): Promise<PersistActionsContainer<T>> {
    return this._baseUI.showPersistentActions(this._sessionId, message, actions, actionsListener);
  }

  public closeSession(): Promise<void> {
    return this._baseUI.closeSession(this._sessionId);
  }

  public async onExit(...args: any[]): Promise<void> {
    return this._baseUI.onExit(args[0], args[1]);
  }
}
