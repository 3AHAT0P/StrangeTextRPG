export type MessageType = 'default' | 'damageDealt' | 'damageTaken' | 'option' | 'stats' | 'markdown' | 'clean';

export abstract class AbstractUI {
  public abstract sendToUser(message: string, type: MessageType): Promise<void>;
  public abstract waitInteraction(): Promise<string>;
  public abstract interactWithUser(message: string, options: string[]): Promise<string>;

  public async onExit(...args: any[]): Promise<void> { /* pass */ }
}
