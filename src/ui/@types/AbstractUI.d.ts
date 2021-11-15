import type { BaseUserActSelector } from '../UserActSelectors/BaseUserActSelector';
import type { UserActSelectorType } from '../UserActSelectors/UserActSelectorManager';

import { StartTheGameCallback, FinishTheGameCallback } from './GameCallbacks';

export interface AbstractUI {
  init(runOnStart: StartTheGameCallback, runOnFinish: FinishTheGameCallback): this;

  createUserActSelector(type: UserActSelectorType): BaseUserActSelector;

  getUserActSelector(type: UserActSelectorType): BaseUserActSelector;

  sendToUser(message: string, cleanAcions?: boolean): Promise<void>;

  closeSession(): Promise<void>;

  onExit(..._args: any[]): Promise<void>;
}
