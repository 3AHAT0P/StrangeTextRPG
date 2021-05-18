import { catchAndLogError } from '@utils/catchAndLogError';
import { ActionsLayout } from './ActionsLayout';
// eslint-disable-next-line import/no-cycle
import { SessionUIProxy } from './SessionUIProxy';
import { StartTheGameCallback, FinishTheGameCallback, getDefaultAdditionalSessionInfo } from './utils';

export abstract class AbstractSessionUI {
  public abstract sendToUser(sessionId: string, message: string, cleanAcions?: boolean): Promise<void>;

  public abstract interactWithUser<T extends string>(
    sessionId: string, message: string, actions: ActionsLayout<T>,
  ): Promise<T>;

  public abstract closeSession(sessionId: string): Promise<void>;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public init(runOnStart: StartTheGameCallback, runOnFinish: FinishTheGameCallback): this {
    const sessionId = Math.random().toString();
    const sessionUI = new SessionUIProxy(this, sessionId);
    catchAndLogError('AbstractSessionUI::init', runOnStart(sessionId, sessionUI, getDefaultAdditionalSessionInfo()));
    return this;
  }

  public abstract onExit(sessionIds: string[], event: string): Promise<void>;
}
