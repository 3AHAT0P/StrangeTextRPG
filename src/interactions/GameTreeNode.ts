export class GameTreeNode {
  public message: string;

  public actions: Map<string, GameTreeNode>;

  constructor(message: string, actions?: Array<[string, GameTreeNode]>) {
    this.message = message;
    this.actions = new Map();
    if (actions != null) {
      for (const [message, child] of actions) {
        this.actions.set(message, child);
      }
    }
  }

  public addAction(message: string, nextNode: GameTreeNode): this {
    this.actions.set(message, nextNode);
    return this;
  }
}
