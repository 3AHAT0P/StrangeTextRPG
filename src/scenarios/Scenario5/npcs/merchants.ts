import { SmallHealingPotion } from '@actors/potions';

import { MerchantProduct } from '@scenarios/@types';

const merchantGoods = new Map<number, Set<MerchantProduct>>();
merchantGoods.set(1, new Set([
  {
    internalName: 'healthPoitions',
    displayName: 'Зелье лечения',
    price: 10,
    item: new SmallHealingPotion(),
  },
]));
merchantGoods.set(2, new Set([
  {
    internalName: 'healthPoitions',
    displayName: 'Зелье лечения',
    price: 10,
    item: new SmallHealingPotion(),
  },
]));
merchantGoods.set(3, new Set([
  {
    internalName: 'healthPoitions',
    displayName: 'Зелье лечения',
    price: 10,
    item: new SmallHealingPotion(),
  },
]));
merchantGoods.set(4, new Set([
  {
    internalName: 'healthPoitions',
    displayName: 'Зелье лечения',
    price: 10,
    item: new SmallHealingPotion(),
  },
]));
merchantGoods.set(5, new Set([
  {
    internalName: 'healthPoitions',
    displayName: 'Зелье лечения',
    price: 10,
    item: new SmallHealingPotion(),
  },
]));

export { merchantGoods };
