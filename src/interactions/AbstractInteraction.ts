import { AbstractUI } from "../ui/AbstractUI";

export interface Interactable {
  interact(): Promise<Interactable | null>;
  addAction(message: string, nextNode: Interactable): this;
  addAutoAction(nextNode: Interactable): this;
  removeAction(message: string): this;
}

export interface AbstractInteractionOptions {
  ui: AbstractUI;
}

export const ACTION_AUTO = 'auto';

export abstract class AbstractInteraction implements Interactable {
  protected ui: AbstractUI;
  protected actions: Map<string, AbstractInteraction> = new Map();

  constructor({ ui }: AbstractInteractionOptions) {
    this.ui = ui;
  }

  public addAction(message: string, nextNode: AbstractInteraction): this {
    this.actions.set(message, nextNode);
    return this;
  }

  public addAutoAction(nextNode: AbstractInteraction): this {
    this.actions.set(ACTION_AUTO, nextNode);
    return this;
  }

  public removeAction(message: string): this {
    this.actions.delete(message);
    return this;
  }

  protected async beforeActivate(): Promise<string> {
    return 'DEFAULT MESSAGE!';
  }

  protected async activate(message: string): Promise<string> {
    const autoInteractions = this.actions.get(ACTION_AUTO);
    if (autoInteractions != null) {
      await this.ui.sendToUser(message, 'default');
      return ACTION_AUTO;
    }

    if (this.actions.size === 0) throw new Error('Action list is empty');

    return await this.ui.interactWithUser(message, Array.from(this.actions.keys()));
  }

  protected async afterActivate(action: string): Promise<AbstractInteraction | null> {
    const nextInteraction = this.actions.get(action);
    if (nextInteraction == null) {
      console.log(new Error(`Selected action is null: ${action}`));
      // throw new Error('Selected action is incorrect');
      return null;
    }
    return nextInteraction;
  }

  public async interact(): Promise<AbstractInteraction | null> {
    const message = await this.beforeActivate();
    const action = await this.activate(message);
    return this.afterActivate(action);
  }
}