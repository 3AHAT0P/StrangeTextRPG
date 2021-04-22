export type MessageType = "default" | "damageDealt" | "damageTaken" | "option" | "stats";

export abstract class AbstractUI {
  public abstract sendToUser(message: string, type: MessageType): void;
  public abstract waitInteraction(): Promise<number>;
  public abstract interactWithUser(messages: string[], options?: string[]): Promise<number>;
}
