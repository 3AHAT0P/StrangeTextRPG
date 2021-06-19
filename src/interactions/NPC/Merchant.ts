import {
  AbstractInteraction,
  SimpleInteraction, Interaction,
} from '@interactions';
import { AbstractItem } from '@actors/AbstractItem';

import { AbstractNPCOptions, AbstractNPC } from './AbstractNPC';

export interface GoodItem {
  name: string;
  message: string;
  action: string;
  price: number;
  item: AbstractItem;
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

    const introInteraction = new SimpleInteraction({ ui, message: '💬 [Торговец]: Привет!' });

    const notEnoughtMoneyInteraction = new SimpleInteraction({
      ui,
      message: `💬 [Торговец]: К сожалению, у ${player.getType({ declension: 'genitive' })} не хватает золота.`,
    });

    const i1 = new SimpleInteraction({
      ui,
      message: `💬 [Торговец]: Извини, за столь скудный выбор.\n${
        Array.from(this.goods.values()).map(({ message }, index) => `${index + 1}. ${message}`).join('\n')}`,
    });
    introInteraction.addAction('Привет!', i1, `💬 [${player.getType({ declension: 'nominative', capitalised: true })}]: Привет!`);

    const i2 = new SimpleInteraction({ ui, message: '💬 [Торговец]: Чего изволишь?' });
    i1.addAutoAction(i2);
    notEnoughtMoneyInteraction.addAutoAction(i2);

    for (const goodItem of this.goods.values()) {
      const i3 = new Interaction({
        ui,
        async activate() {
          const result = player.exchangeGoldToItem(goodItem.price, [goodItem.item]);
          if (!result) return notEnoughtMoneyInteraction;

          const playerGold = player.inventory.gold;

          const i4 = new SimpleInteraction({
            ui,
            message: `⚙️ У ${player.getType({ declension: 'genitive' })} осталось ${playerGold} золота`,
          });

          i4.addAutoAction(i2);

          return i4;
        },
      });
      i2.addAction(`${goodItem.action} ${goodItem.item.baseName}`, i3);
    }

    const epilogInteraction = new SimpleInteraction({ ui, message: '💬 [Торговец]: Приходи еще :)' });
    i2.addAction('Ничего, спасибо.', epilogInteraction, `💬 [${player.getType({ declension: 'nominative', capitalised: true })}]: Ничего, спасибо.`);

    return [introInteraction, epilogInteraction];
  }
}
