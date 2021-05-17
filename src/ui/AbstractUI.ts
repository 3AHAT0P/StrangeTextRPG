import { ActionsLayout } from './ActionsLayout';

export abstract class AbstractUI {
  public abstract sendToUser(message: string, cleanAcions?: boolean): Promise<void>;

  public abstract interactWithUser<T extends string>(message: string, actions: ActionsLayout<T>): Promise<T>;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async onExit(..._args: any[]): Promise<void> { /* pass */ }
}
