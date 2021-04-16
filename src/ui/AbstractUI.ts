export abstract class AbstractUI {
  public abstract waitInteraction(): Promise<number>;
  public abstract interactWithUser(messages: string[], options?: string[]): Promise<number>;
}
