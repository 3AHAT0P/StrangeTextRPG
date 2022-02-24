import type { AbstractUI } from './AbstractUI';
import type { AbstractSessionUI } from './AbstractSessionUI';
import type { AdditionalSessionInfo } from './AdditionalSessionInfo';

export type StartTheGameCallback = (
  sessionId: string,
  ui: AbstractUI,
  additionalSessionInfo: AdditionalSessionInfo,
) => Promise<void>;

export type FinishTheGameCallback = (
  sessionId: string,
  ui: AbstractSessionUI,
) => Promise<void>;
