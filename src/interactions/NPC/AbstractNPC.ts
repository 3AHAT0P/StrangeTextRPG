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

  protected buildInteractionSequance(): Promise<[AbstractInteraction, AbstractInteraction]> {
    const introInteraction = new SimpleInteraction({ ui: this.ui, message: 'Привет!' });
    const epilogInteraction = new SimpleInteraction({ ui: this.ui, message: 'Пока!' });

    introInteraction.addAction('Привет!', epilogInteraction);

    return Promise.resolve([introInteraction, epilogInteraction]);
  }

  protected async activate(): Promise<string> {
    const [intro, epilog] = await this.buildInteractionSequance();

    epilog.copyActionsFrom(this.actions);

    this.removeAllAutoActions();
    this.addAutoAction(intro);

    return ACTION_AUTO;
  }
}
