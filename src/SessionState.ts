import { Player } from '@actors';
import { AbstractUI, AdditionalSessionInfo } from '@ui/@types';

export interface SessionState {
  sessionId: string;
  player: Player;
  additionalInfo: AdditionalSessionInfo;
  finishSession(): Promise<void>;
  status: 'ALIVE' | 'DEAD';
  ui: AbstractUI;
}

export {};
