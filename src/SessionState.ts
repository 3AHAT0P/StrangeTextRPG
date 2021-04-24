import { AbstractActor } from "./actors/AbstractActor";
import { AbstractInteraction } from "./interactions/AbstractInteraction";
import { AdditionalSessionInfo } from "./ui/TelegramBotUI";

export interface SessionState {
  sessionId: string;
  player: AbstractActor;
  currentInteraction: AbstractInteraction;
  additionalInfo: AdditionalSessionInfo;
  finishSession(): Promise<void>;
}

export {}
