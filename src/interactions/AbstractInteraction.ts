import { AbstractUI } from '@ui/AbstractUI';
import { ActionsLayout } from '@ui/ActionsLayout';
import logger from '@utils/Logger';
// eslint-disable-next-line import/no-cycle
import { ActionMap } from './ActionMap';

export interface Interactable {
  interact(): Promise<Interactable | null>;
  addAction(message: string, nextNode: Interactable): this;
  addAutoAction(nextNode: Interactable): this;
  removeAction(message: string): this;
}

export interface AbstractInteractionOptions {
  ui: AbstractUI;
  actionsLayout?: ActionsLayout<string>;
}

export const ACTION_AUTO = 'auto';

export abstract class AbstractInteraction implements Interactable {
  protected ui: AbstractUI;

  protected actions: ActionMap = new ActionMap();

  protected actionsLayout: ActionsLayout<string> = new ActionsLayout({ columns: 2 });

  constructor({ ui, actionsLayout }: AbstractInteractionOptions) {
    this.ui = ui;
    if (actionsLayout != null) this.actionsLayout = actionsLayout;
  }

  public addAction(message: string, nextNode: AbstractInteraction, showableText: string = ''): this {
    this.actions.addRecord(this.actions.generateId(), message, 'CUSTOM', showableText, nextNode);
    return this;
  }

  public addAutoAction(nextNode: AbstractInteraction): this {
    this.actions.addRecord(this.actions.generateId(), ACTION_AUTO, 'AUTO', '', nextNode);
    return this;
  }

  public addSystemAction(message: string, nextNode: AbstractInteraction): this {
    this.actions.addRecord(this.actions.generateId(), message, 'SYSTEM', '', nextNode);
    return this;
  }

  public copyActionsFrom(actionMap: ActionMap): this {
    actionMap.getList().forEach((record) => this.actions.addRecord(...record));
    return this;
  }

  public removeAction(message: string): this {
    this.actions.deleteRecordByAction(message);
    return this;
  }

  public removeAllAutoActions(): this {
    this.actions.deleteRecordByAction(ACTION_AUTO);
    return this;
  }

  protected async beforeActivate(): Promise<string> {
    return 'DEFAULT MESSAGE!';
  }

  protected async activate(message: string): Promise<string> {
    await this.ui.sendToUser(message);
    const autoInteractions = this.actions.getActionsByType('AUTO');
    if (autoInteractions.length > 0) {
      return ACTION_AUTO;
    }

    if (this.actions.size === 0) throw new Error('Action list is empty');

    this.actionsLayout.clear();
    return this.ui.interactWithUser(this.actionsLayout.addRow(...this.actions.getActionsByType('CUSTOM')));
  }

  protected async afterActivate(action: string): Promise<AbstractInteraction | null> {
    const [, , , showableText, nextInteraction] = this.actions.getRecordByAction(action) ?? [];
    if (nextInteraction == null) {
      logger.error('AbstractInteraction::afterActivate', new Error(`Selected action is null: ${action}`));
      // throw new Error('Selected action is incorrect');
      return null;
    }

    if (showableText != null && showableText !== '') await this.ui.sendToUser(showableText);
    return nextInteraction;
  }

  public async interact(): Promise<AbstractInteraction | null> {
    const message = await this.beforeActivate();
    const action = await this.activate(message);
    return this.afterActivate(action);
  }
}
