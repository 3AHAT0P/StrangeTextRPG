import { AbstractActor } from './actors/AbstractActor';
import { AbstractInteraction } from './interactions/AbstractInteraction';
import { AdditionalSessionInfo } from './ui/AbstractSessionUI';
import { AbstractUI } from './ui/AbstractUI';

export interface SessionState {
  sessionId: string;
  player: AbstractActor;
  currentInteraction: AbstractInteraction;
  additionalInfo: AdditionalSessionInfo;
  finishSession(): Promise<void>;
  status: 'ALIVE' | 'DEAD';
  ui: AbstractUI;
}

export {};
