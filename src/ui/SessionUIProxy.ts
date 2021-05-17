import { AbstractUI } from './AbstractUI';
import { AbstractSessionUI } from './AbstractSessionUI';
import { ActionsLayout } from './ActionsLayout';

export class SessionUIProxy extends AbstractUI {
  constructor(private readonly _baseUI: AbstractSessionUI, private readonly _sessionId: string) {
    super();
  }

  public sendToUser(message: string, cleanAcions?: boolean): Promise<void> {
    return this._baseUI.sendToUser(this._sessionId, message, cleanAcions);
  }

  public interactWithUser<T extends string>(message: string, actions: ActionsLayout<T>): Promise<T> {
    return this._baseUI.interactWithUser(this._sessionId, message, actions);
  }

  public async onExit(...args: any[]): Promise<void> {
    return this._baseUI.onExit(args[0], args[1]);
  }
}
