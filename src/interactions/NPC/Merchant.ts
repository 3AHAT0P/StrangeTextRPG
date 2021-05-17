import {
  AbstractInteraction, ACTION_AUTO,
  SimpleInteraction, Interaction,
} from '@interactions';

import { AbstractNPCOptions, AbstractNPC } from './AbstractNPC';

export interface GoodItem {
  name: string;
  action: string;
  price: number;
}

export interface MerchantNPCOptions extends AbstractNPCOptions {
  goods: Set<GoodItem>;
}

export class MerchantNPC extends AbstractNPC {
  protected goods: Set<GoodItem>;

  constructor(options: MerchantNPCOptions) {
    super(options);

    this.goods = options.goods;
  }

  protected async buildInteractionSequance(): Promise<[AbstractInteraction, AbstractInteraction]> {
    const { ui } = this;
    const { player } = this;

    const introInteraction = new SimpleInteraction({ ui, message: 'Привет!' });

    const notEnoughtMoneyInteraction = new SimpleInteraction({
      ui,
      message: `К сожалению, у ${player.getType({ declension: 'genitive' })} не хватает золота.`,
    });

    const i1 = new SimpleInteraction({ ui, message: 'Извини, за столь скудный выбор.' });
    introInteraction.addAction('Привет!', i1);

    const i2 = new SimpleInteraction({ ui, message: 'Чего изволишь?' });
    i1.addAction(ACTION_AUTO, i2);
    notEnoughtMoneyInteraction.addAction(ACTION_AUTO, i2);

    for (const goodItem of this.goods.values()) {
      const i3 = new Interaction({
        ui,
        async activate() {
          const result = player.exchangeGoldToItem(goodItem.price, { [goodItem.name]: 1 });
          if (!result) return notEnoughtMoneyInteraction;

          const i4 = new SimpleInteraction({
            ui,
            message: `У ${player.getType({ declension: 'genitive' })} осталось ${player.gold} золота`,
          });

          i4.addAction(ACTION_AUTO, i2);

          return i4;
        },
      });
      i2.addAction(goodItem.action, i3);
    }

    const epilogInteraction = new SimpleInteraction({ ui, message: 'Приходи еще :)' });
    i2.addAction('Ничего, спасибо.', epilogInteraction);

    return [introInteraction, epilogInteraction];
  }
}
