import type { BaseUserActSelector } from '@ui/UserActSelectors/BaseUserActSelector';

import { StartTheGameCallback, FinishTheGameCallback } from './GameCallbacks';

export interface AbstractUI {
  init(runOnStart: StartTheGameCallback, runOnFinish: FinishTheGameCallback): this;

  createUserActSelector(id: string, type: string): BaseUserActSelector;

  getUserActSelector(id: string): BaseUserActSelector;

  sendToUser(message: string, cleanAcions?: boolean): Promise<void>;

  closeSession(): Promise<void>;

  onExit(..._args: any[]): Promise<void>;
}
