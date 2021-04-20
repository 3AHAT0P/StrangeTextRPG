import { AbstractUI } from "../ui/AbstractUI";

export abstract class AbstractInteraction {
  protected ui: AbstractUI;
  protected actions: Map<string, AbstractInteraction[]> = new Map();

  public abstract buildMessage(...args: unknown[]): string;

  protected async waitCorrectAnswer(): Promise<AbstractInteraction[]> {
    const childNodeList = Array.from(this.actions.values());
    let nextNode: AbstractInteraction[] | null = null;
    while (nextNode == null) {
      try {
        const userChoise = await this.ui.waitInteraction();
        nextNode = childNodeList[userChoise - 1];
      } catch (error) {
        // pass
      }
    }
    return nextNode;
  }

  constructor(ui: AbstractUI) {
    this.ui = ui;
  }

  public addAction(message: string, nextNode: AbstractInteraction): this {
    const list = this.actions.get(message);
    if (list == null) this.actions.set(message, [nextNode]);
    else list.push(nextNode);
    return this;
  }

  public async activate(): Promise<AbstractInteraction[]> {
    const childNodeList = Array.from(this.actions.values());
    let nextNode: AbstractInteraction[] | null = null;
    try {
      const userChoise = await this.ui.interactWithUser(
        [this.buildMessage()],
        Array.from(this.actions.keys()),
      );
      nextNode = childNodeList[userChoise - 1];
      if (nextNode == null) throw new Error('Answer is incorrect');
    } catch (error) {
      nextNode = await this.waitCorrectAnswer();
    }
    return nextNode;
  }
}