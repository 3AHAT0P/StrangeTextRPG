import { AbstractInteraction, AbstractInteractionOptions } from '_DEPRECATED_interactions/AbstractInteraction';
import { SessionState } from '../SessionState';

export interface AbstractLocationOptions extends AbstractInteractionOptions {
  state: SessionState;
}

export abstract class AbstractLocation extends AbstractInteraction {
  protected state: SessionState;

  constructor(options: AbstractLocationOptions) {
    super(options);
    this.state = options.state;
  }
}
