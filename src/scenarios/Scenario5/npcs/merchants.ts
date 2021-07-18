import { MerchantProduct } from '../@types';

const merchantGoods = new Map<number, Set<MerchantProduct>>();
merchantGoods.set(1, new Set([
  {
    internalName: 'healthPoitions',
    displayName: 'Зелье лечения',
    price: 10,
  },
]));
merchantGoods.set(2, new Set([
  {
    internalName: 'healthPoitions',
    displayName: 'Зелье лечения',
    price: 10,
  },
]));
merchantGoods.set(3, new Set([
  {
    internalName: 'healthPoitions',
    displayName: 'Зелье лечения',
    price: 10,
  },
]));
merchantGoods.set(4, new Set([
  {
    internalName: 'healthPoitions',
    displayName: 'Зелье лечения',
    price: 10,
  },
]));
merchantGoods.set(5, new Set([
  {
    internalName: 'healthPoitions',
    displayName: 'Зелье лечения',
    price: 10,
  },
]));

export { merchantGoods };
