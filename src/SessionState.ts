import { Player } from '@actors';
import { AbstractUI, AdditionalSessionInfo, PersistActionsContainer } from '@ui';

export interface SessionState {
  sessionId: string;
  player: Player;
  additionalInfo: AdditionalSessionInfo;
  finishSession(): Promise<void>;
  status: 'ALIVE' | 'DEAD';
  ui: AbstractUI;
  persistActionsContainers: PersistActionsContainer<string>[];
}

export {};
