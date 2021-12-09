import type { UserAction } from './UserActSelectors/BaseUserActSelector';

export interface UserActionsAdapterOptions {
  transport: any;
  sessionId: string;
}

export abstract class UserActSelectorAbstractAdapter {
  protected _transport: any;

  protected _sessionId: string;

  protected _defer: {
    resolve: (actionId: number) => void;
    reject: (error: Error) => void;
  } | null = null;

  constructor(options: UserActionsAdapterOptions) {
    this._transport = options.transport;
    this._sessionId = options.sessionId;
  }

  public init(): void { }

  public abstract show(layout: UserAction<unknown>[][]): Promise<number>;

  public abstract hide(): Promise<boolean>;
}
