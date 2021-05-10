import { AbstractInteraction, AbstractInteractionOptions } from "./AbstractInteraction";

export const isSimpleInteraction = (
  interaction: AbstractInteraction,
): interaction is SimpleInteraction => interaction instanceof SimpleInteraction;

export interface SimpleInteractionOptions extends AbstractInteractionOptions {
  message: string;
}

export class SimpleInteraction extends AbstractInteraction {
  private message: string;

  constructor(options: SimpleInteractionOptions) {
    super(options);

    this.message = options.message;
  }

  protected async beforeActivate(): Promise<string> {
    return this.message;
  }
}
