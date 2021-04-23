import { AbstractUI, MessageType } from "./AbstractUI";
import { AbstractSessionUI } from './AbstractSessionUI';

export class SessionUIProxy extends AbstractUI {

  constructor(private readonly _baseUI: AbstractSessionUI, private readonly _sessionId: string) {
    super();
  }
  public sendToUser(message: string, type: MessageType): Promise<void> {
    return this._baseUI.sendToUser(this._sessionId, message, type);
  }
  public waitInteraction(): Promise<string> {
    return this._baseUI.waitInteraction(this._sessionId);
  }
  public interactWithUser(message: string, options: string[]): Promise<string> {
    return this._baseUI.interactWithUser(this._sessionId, message, options);
  }
}
