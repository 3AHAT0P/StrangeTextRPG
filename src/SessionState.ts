import { AbstractActor } from '@actors';
import { AbstractUI, AdditionalSessionInfo, PersistActionsContainer } from '@ui';
import type { AbstractInteraction } from '@interactions';

export interface SessionState {
  sessionId: string;
  player: AbstractActor;
  currentInteraction: AbstractInteraction;
  additionalInfo: AdditionalSessionInfo;
  finishSession(): Promise<void>;
  status: 'ALIVE' | 'DEAD';
  ui: AbstractUI;
  persistActionsContainers: PersistActionsContainer<string>[];
}

export {};
