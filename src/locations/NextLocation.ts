import { AbstractInteraction } from "../interactions/AbstractInteraction";

export interface NextLocation {
  actionMessage: string;
  interaction: AbstractInteraction;
}

export {};
