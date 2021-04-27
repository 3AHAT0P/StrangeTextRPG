import { AbstractUI } from "../ui/AbstractUI";

export interface Interactable {
  activate(): Promise<AbstractInteraction | null>;
}

export abstract class AbstractInteraction implements Interactable {
  protected ui: AbstractUI;
  protected actions: Map<string, AbstractInteraction> = new Map();

  public abstract buildMessage(...args: unknown[]): string;

  constructor(ui: AbstractUI) {
    this.ui = ui;
  }

  public addAction(message: string, nextNode: AbstractInteraction): this {
    this.actions.set(message, nextNode);
    return this;
  }

  public removeAction(message: string): this {
    this.actions.delete(message);
    return this;
  }

  public async activate(): Promise<AbstractInteraction | null> {
    const autoInteractions = this.actions.get('auto');
    if (autoInteractions != null) {
      this.ui.sendToUser(this.buildMessage(), 'default');
      return autoInteractions;
    }

    const option = await this.ui.interactWithUser(
      this.buildMessage(),
      Array.from(this.actions.keys()),
    );
    const nextNode = this.actions.get(option);
    if (nextNode == null) throw new Error('Answer is incorrect');
    return nextNode;
  }
}