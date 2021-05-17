import { AbstractInteraction, SimpleInteraction } from '@interactions';
import { AbstractNPC } from '@NPC/AbstractNPC';

export class CoachmanNPC extends AbstractNPC {
  protected async buildInteractionSequance(): Promise<[AbstractInteraction, AbstractInteraction]> {
    const { ui } = this;
    // const { player } = this;

    const introInteraction = new SimpleInteraction({ ui, message: 'О, наконец то!' });

    const i2 = new SimpleInteraction({ ui, message: 'Ты меня не помнишь?' });
    introInteraction.addAction('Ты кто такой?', i2);

    // .....

    const epilogInteraction = new SimpleInteraction({ ui, message: 'Приходи еще :)' });

    return [introInteraction, epilogInteraction];
  }
}
