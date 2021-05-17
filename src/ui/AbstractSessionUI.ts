import { ActionsLayout } from './ActionsLayout';

export interface AdditionalSessionInfo {
  playerName: string;
  playerId: string;
}

export type StartTheGameCallback = (
  sessionId: string,
  ui: AbstractSessionUI,
  additionalSessionInfo: AdditionalSessionInfo,
) => Promise<void>;

export type FinishTheGameCallback = (
  sessionId: string,
  ui: AbstractSessionUI,
) => Promise<void>;

export abstract class AbstractSessionUI {
  public abstract sendToUser(sessionId: string, message: string, cleanAcions?: boolean): Promise<void>;

  public abstract interactWithUser<T extends string>(
    sessionId: string, message: string, actions: ActionsLayout<T>,
  ): Promise<T>;

  public abstract closeSession(sessionId: string): Promise<void>;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public init(runOnStart: StartTheGameCallback, runOnFinish: FinishTheGameCallback): this {
    setTimeout(runOnStart, 16, Math.random().toString(), this);
    return this;
  }

  public abstract onExit(sessionIds: string[], event: string): Promise<void>;
}
