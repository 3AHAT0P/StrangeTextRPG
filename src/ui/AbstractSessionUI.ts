import { MessageType } from "./AbstractUI";

export abstract class AbstractSessionUI {
  public abstract sendToUser(sessionId: string, message: string, type: MessageType): void;
  public abstract waitInteraction(sessionId: string): Promise<string>;
  public abstract interactWithUser(sessionId: string, message: string, options: string[]): Promise<string>;

  public init(runOnStart: (fullUserId: string, ui: AbstractSessionUI) => Promise<void>): this {
    setTimeout(runOnStart, 16, Math.random().toString(), this);
    return this;
  }
}
