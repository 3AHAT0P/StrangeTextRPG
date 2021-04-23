import { AbstractActor } from "./actors/AbstractActor";
import { AbstractInteraction } from "./interactions/AbstractInteraction";

export interface SessionState {
  player: AbstractActor;
  currentInteraction: AbstractInteraction;
}

export {}
