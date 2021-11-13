import type { BaseUserActSelector } from '@ui/UserActSelectors/BaseUserActSelector';

import { StartTheGameCallback, FinishTheGameCallback } from './GameCallbacks';

export interface AbstractSessionUI {
  init(runOnStart: StartTheGameCallback, runOnFinish: FinishTheGameCallback): this;

  createUserActSelector(sessionId: string, id: string, type: string): BaseUserActSelector;

  getUserActSelector(sessionId: string, id: string): BaseUserActSelector;

  sendToUser(sessionId: string, message: string, cleanAcions?: boolean): Promise<void>;

  closeSession(sessionId: string): Promise<void>;

  onExit(sessionIds: string[], event: string): Promise<void>;
}
