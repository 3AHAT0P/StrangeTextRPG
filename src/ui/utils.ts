import type { AbstractSessionUI } from './AbstractSessionUI';
import type { AbstractUI } from './AbstractUI';
import type { ActionsLayout } from './ActionsLayout';

export interface AdditionalSessionInfo {
  playerName: string;
  playerId: string;
}

export interface PersistActionsContainer<T extends string> {
  updateText: (newMessage: string) => Promise<void>;
  updateKeyboard: (newActions: ActionsLayout<T>) => Promise<void>;
  delete: () => Promise <void>;
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
