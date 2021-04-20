export abstract class AbstractUI {
  public abstract sendToUser(message: string): void;
  public abstract waitInteraction(): Promise<number>;
  public abstract interactWithUser(messages: string[], options?: string[]): Promise<number>;
}
