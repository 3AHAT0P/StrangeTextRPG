export type MessageType = "default" | "damageDealt" | "damageTaken" | "option" | "stats";

export abstract class AbstractUI {
  public abstract sendToUser(message: string, type: MessageType): void;
  public abstract waitInteraction(): Promise<string>;
  public abstract interactWithUser(message: string, options: string[]): Promise<string>;
}
