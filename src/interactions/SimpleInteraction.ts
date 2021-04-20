import { AbstractUI } from "../ui/AbstractUI";
import { AbstractInteraction } from "./AbstractInteraction";

export const isSimpleInteraction = (
  interaction: AbstractInteraction,
): interaction is SimpleInteraction => interaction instanceof SimpleInteraction;

export interface SimpleInteractionOptions {
  message: string;
}

export class SimpleInteraction extends AbstractInteraction {
  private message: string;

  constructor(ui: AbstractUI, options: SimpleInteractionOptions) {
    super(ui);

    this.message = options.message;
    // if (options.activated) this._activated = options.activated;
  }

  public buildMessage(): string {
    return this.message;
  }
}
