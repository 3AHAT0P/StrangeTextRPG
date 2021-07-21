import { HealthPotion } from '@actors/potions';

import { MerchantProduct } from '../@types';

const merchantGoods = new Map<number, Set<MerchantProduct>>();
merchantGoods.set(1, new Set([
  {
    internalName: 'healthPoitions',
    displayName: 'Зелье лечения',
    price: 10,
    item: new HealthPotion(),
  },
]));
merchantGoods.set(2, new Set([
  {
    internalName: 'healthPoitions',
    displayName: 'Зелье лечения',
    price: 10,
    item: new HealthPotion(),
  },
]));
merchantGoods.set(3, new Set([
  {
    internalName: 'healthPoitions',
    displayName: 'Зелье лечения',
    price: 10,
    item: new HealthPotion(),
  },
]));
merchantGoods.set(4, new Set([
  {
    internalName: 'healthPoitions',
    displayName: 'Зелье лечения',
    price: 10,
    item: new HealthPotion(),
  },
]));
merchantGoods.set(5, new Set([
  {
    internalName: 'healthPoitions',
    displayName: 'Зелье лечения',
    price: 10,
    item: new HealthPotion(),
  },
]));

export { merchantGoods };
