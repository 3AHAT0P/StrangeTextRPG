/* eslint-disable max-classes-per-file */
export type ItemType = 'QUEST' | 'GEMS' | 'MISCELLANEOUS' | 'GOODS' | 'WEAPON' | 'ARMOR';
export const itemRarity = {
  COMMON: 1, RARE: 2, EPIC: 3, LEGENDARY: 4, DIVINE: 5,
} as const;
export type ItemRarity = keyof typeof itemRarity;

export abstract class Item {
  abstract itemType: ItemType;

  abstract name: string;

  abstract rarity: ItemRarity;
}
