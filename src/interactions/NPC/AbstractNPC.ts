import { AbstractActor } from '@actors/AbstractActor';
import {
  AbstractInteraction, AbstractInteractionOptions, ACTION_AUTO,
  SimpleInteraction,
} from '@interactions';

export interface AbstractNPCOptions extends AbstractInteractionOptions {
  player: AbstractActor;
}

export class AbstractNPC extends AbstractInteraction {
  protected player: AbstractActor;

  constructor(options: AbstractNPCOptions) {
    super(options);

    this.player = options.player;
  }

  protected async buildInteractionSequance(): Promise<[AbstractInteraction, AbstractInteraction]> {
    // pass
    const introInteraction = new SimpleInteraction({ ui: this.ui, message: 'Привет!' });
    const epilogInteraction = new SimpleInteraction({ ui: this.ui, message: 'Пока!' });

    introInteraction.addAction('Привет!', epilogInteraction);

    return [introInteraction, epilogInteraction];
  }

  protected async activate(): Promise<string> {
    const [intro, epilog] = await this.buildInteractionSequance();

    for (const [action, interaction] of this.actions.entries()) {
      epilog.addAction(action, interaction);
    }

    this.actions.set(ACTION_AUTO, intro);

    return ACTION_AUTO;
  }
}
