import type { BaseUserActSelector } from '../UserActSelectors/BaseUserActSelector';
import type { UserActSelectorType } from '../UserActSelectors/UserActSelectorManager';

import { StartTheGameCallback, FinishTheGameCallback } from './GameCallbacks';

export interface AbstractSessionUI {
  init(runOnStart: StartTheGameCallback, runOnFinish: FinishTheGameCallback): this;

  createUserActSelector(sessionId: string, type: UserActSelectorType): BaseUserActSelector;

  getUserActSelector(sessionId: string, type: UserActSelectorType): BaseUserActSelector;

  sendToUser(sessionId: string, message: string, cleanAcions?: boolean): Promise<void>;

  closeSession(sessionId: string): Promise<void>;

  onExit(sessionIds: string[], event: string): Promise<void>;
}
