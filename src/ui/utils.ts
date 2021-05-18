import type { AbstractSessionUI } from './AbstractSessionUI';
import type { AbstractUI } from './AbstractUI';

export interface AdditionalSessionInfo {
  playerName: string;
  playerId: string;
}

export const getDefaultAdditionalSessionInfo = (): AdditionalSessionInfo => ({ playerName: 'Путник', playerId: '1' });

export type StartTheGameCallback = (
  sessionId: string,
  ui: AbstractUI,
  additionalSessionInfo: AdditionalSessionInfo,
) => Promise<void>;

export type FinishTheGameCallback = (
  sessionId: string,
  ui: AbstractSessionUI,
) => Promise<void>;
