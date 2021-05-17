import { AbstractInteraction, AbstractInteractionOptions } from '@interactions/AbstractInteraction';
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
