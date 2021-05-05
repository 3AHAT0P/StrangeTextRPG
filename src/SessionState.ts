import { AbstractActor } from "./actors/AbstractActor";
import { Interactable } from "./interactions/AbstractInteraction";
import { AdditionalSessionInfo } from "./ui/AbstractSessionUI";
import { AbstractUI } from "./ui/AbstractUI";

export interface SessionState {
  sessionId: string;
  player: AbstractActor;
  currentInteraction: Interactable;
  additionalInfo: AdditionalSessionInfo;
  finishSession(): Promise<void>;
  status: 'ALIVE' | 'DEAD';
  ui: AbstractUI;
}

export {}
