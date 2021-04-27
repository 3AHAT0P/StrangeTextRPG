import { AbstractActor } from "./actors/AbstractActor";
import { Interactable } from "./interactions/AbstractInteraction";
import { AdditionalSessionInfo } from "./ui/AbstractSessionUI";

export interface SessionState {
  sessionId: string;
  player: AbstractActor;
  currentInteraction: Interactable;
  additionalInfo: AdditionalSessionInfo;
  finishSession(): Promise<void>;
}

export {}
