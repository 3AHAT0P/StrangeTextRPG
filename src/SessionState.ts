import { AbstractActor } from "./actors/AbstractActor";
import { AbstractInteraction } from "./interactions/AbstractInteraction";

export interface SessionState {
  sessionId: string;
  player: AbstractActor;
  currentInteraction: AbstractInteraction;
  finishSession(): Promise<void>;
}

export {}
