import { MessageType } from "./AbstractUI";

export abstract class AbstractSessionUI {
  public abstract sendToUser(sessionId: string, message: string, type: MessageType): Promise<void>;
  public abstract waitInteraction(sessionId: string): Promise<string>;
  public abstract interactWithUser(sessionId: string, message: string, options: string[]): Promise<string>;

  public abstract closeSession(sessionId: string): Promise<void>;

  public init(runOnStart: (fullUserId: string, ui: AbstractSessionUI) => Promise<void>): this {
    setTimeout(runOnStart, 16, Math.random().toString(), this);
    return this;
  }

  public abstract onExit(sessionIds: string[], event: string): Promise<void>;
}
