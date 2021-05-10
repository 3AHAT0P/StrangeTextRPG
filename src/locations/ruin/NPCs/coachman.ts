import { AbstractInteraction, ACTION_AUTO } from "../../../interactions/AbstractInteraction";
import { Interaction } from "../../../interactions/Interaction";
import { AbstractNPC } from "../../../interactions/NPC/AbstractNPC";
import { SimpleInteraction } from "../../../interactions/SimpleInteraction";

export class CoachmanNPC extends AbstractNPC {
  protected async buildInteractionSequance(): Promise<[AbstractInteraction, AbstractInteraction]> {
    const ui = this.ui;
    const player = this.player;

    const introInteraction = new SimpleInteraction({ ui, message: 'О, наконец то!' });

    const i2 = new SimpleInteraction({ ui, message: 'Ты меня не помнишь?'});
    introInteraction.addAction('Ты кто такой?', i2);

    // .....

    const epilogInteraction = new SimpleInteraction({ ui, message: 'Приходи еще :)' });

    return [introInteraction, epilogInteraction];
  }
}