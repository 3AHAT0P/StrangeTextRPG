import { AbstractUI } from '@ui/AbstractUI';
import { ActionsLayout } from '@ui/ActionsLayout';

export interface Interactable {
  interact(): Promise<Interactable | null>;
  addAction(message: string, nextNode: Interactable): this;
  addAutoAction(nextNode: Interactable): this;
  removeAction(message: string): this;
}

export interface AbstractInteractionOptions {
  ui: AbstractUI;
  actionsLayout?: ActionsLayout<string>;
  printAction?: boolean;
}

export const ACTION_AUTO = 'auto';

export abstract class AbstractInteraction implements Interactable {
  protected ui: AbstractUI;

  protected actions: Map<string, AbstractInteraction> = new Map<string, AbstractInteraction>();

  protected actionsLayout: ActionsLayout<string> = new ActionsLayout({ columns: 2 });

  protected printAction: boolean = false;

  constructor({ ui, actionsLayout, printAction }: AbstractInteractionOptions) {
    this.ui = ui;
    if (actionsLayout != null) this.actionsLayout = actionsLayout;
    if (printAction != null) this.printAction = printAction;
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
    await this.ui.sendToUser(message);
    const autoInteractions = this.actions.get(ACTION_AUTO);
    if (autoInteractions != null) {
      return ACTION_AUTO;
    }

    if (this.actions.size === 0) throw new Error('Action list is empty');

    return this.ui.interactWithUser(new ActionsLayout().addRow(...this.actions.keys()));
  }

  protected async afterActivate(action: string): Promise<AbstractInteraction | null> {
    const nextInteraction = this.actions.get(action);
    if (nextInteraction == null) {
      console.log(new Error(`Selected action is null: ${action}`));
      // throw new Error('Selected action is incorrect');
      return null;
    }
    if (this.printAction && action !== ACTION_AUTO) await this.ui.sendToUser(action);
    return nextInteraction;
  }

  public async interact(): Promise<AbstractInteraction | null> {
    const message = await this.beforeActivate();
    const action = await this.activate(message);
    return this.afterActivate(action);
  }
}
