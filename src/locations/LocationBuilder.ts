import { AbstractInteraction } from "../interactions/AbstractInteraction";
import { SessionState } from "../SessionState";
import { AbstractUI } from "../ui/AbstractUI";
import { NextLocation } from "./NextLocation";

export interface LocationBuilder {
  (ui: AbstractUI, state: SessionState, nextLocations: NextLocation[]): AbstractInteraction;
}

export { };
