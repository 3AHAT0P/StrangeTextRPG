import { AbstractInteraction, Interactable } from "../interactions/AbstractInteraction";
import { SessionState } from "../SessionState";
import { AbstractUI } from "../ui/AbstractUI";

import { NextLocation } from "./NextLocation";

export interface AbstractLocationOptions {
  ui: AbstractUI;
  state: SessionState;
  nextLocation?: NextLocation;
}

export abstract class AbstractLocation implements Interactable {
  protected ui: AbstractUI;
  protected state: SessionState;
  protected nextLocation?: NextLocation;

  constructor(options: AbstractLocationOptions) {
    this.ui = options.ui;
    this.state = options.state;
    if (options.nextLocation != null)
      this.nextLocation = options.nextLocation;
  }

  public abstract activate(): Promise<AbstractInteraction | null>;

  public addAction(message: string, nextNode: Interactable): this {
    console.log('HMM. I\'s wrong!');
    return this;
  }
}
