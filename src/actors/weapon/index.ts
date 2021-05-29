/* eslint-disable max-classes-per-file */
import { Item, itemRarity, ItemRarity } from '@actors/item';

export type WeaponType = 'FIST' | 'KNIFE' | 'STONE' | 'SHIELD' | 'SWORD' | 'AXE' | 'TEETH' | 'PAWS' | 'NONE';
export type WeaponSubtype = 'ONE_HAND' | 'TWO_HAND' | 'THROWABLE' | 'ESPECIAL';

export abstract class Weapon extends Item {
  readonly itemType = 'WEAPON';

  abstract type: WeaponType;

  abstract subtype: WeaponSubtype;

  abstract attackDamage: number;

  abstract accuracy: number;

  abstract criticalChance: number;

  abstract criticalDamageModifier: number;

  abstract name: string;
}

export class EmptyWeapon extends Weapon {
  readonly type = 'NONE';

  readonly subtype = 'ESPECIAL';

  readonly attackDamage = 0;

  readonly accuracy = 0;

  readonly criticalChance = 0;

  readonly criticalDamageModifier = 0;

  readonly name = 'ничего';

  readonly rarity = 'COMMON';
}

export class TeethWeapon extends Weapon {
  readonly type = 'TEETH';

  readonly subtype = 'ESPECIAL';

  readonly attackDamage = 0.4;

  readonly accuracy = 0.6;

  readonly criticalChance = 0.4;

  readonly criticalDamageModifier = 2;

  readonly name = 'острые зубы';

  readonly rarity = 'COMMON';
}

// add attack number (2 for this)
export class PawsWeapon extends Weapon {
  readonly type = 'PAWS';

  readonly subtype = 'ESPECIAL';

  readonly attackDamage = 0.6;

  readonly accuracy = 0.4;

  readonly criticalChance = 0.2;

  readonly criticalDamageModifier = 2;

  readonly name = 'острые когти';

  readonly rarity = 'COMMON';
}

export class FistWeapon extends Weapon {
  readonly type = 'FIST';

  readonly subtype = 'ESPECIAL';

  readonly attackDamage = 0.3;

  readonly accuracy = 0.8;

  readonly criticalChance = 0.8;

  readonly criticalDamageModifier = 1.4;

  readonly name = 'кулаки';

  readonly rarity = 'COMMON';
}

export class KnifeWeapon extends Weapon {
  readonly type = 'KNIFE';

  readonly subtype = 'ONE_HAND';

  readonly attackDamage: number;

  readonly accuracy = 0.6;

  readonly criticalChance: number;

  readonly criticalDamageModifier = 2;

  readonly name: string;

  readonly rarity: ItemRarity;

  constructor(rarity: ItemRarity = 'COMMON') {
    super();
    this.rarity = rarity;
    const rarityMultiplier = itemRarity[rarity];
    this.attackDamage = 1.5 + 0.5 * rarityMultiplier;
    this.criticalChance = 0.4 + 0.1 * Math.floor(rarityMultiplier / 2);
    this.name = `обычный нож[${rarity}]`;
  }
}

export class RustedSwordWeapon extends Weapon {
  readonly type = 'SWORD';

  readonly subtype = 'ONE_HAND';

  readonly attackDamage: number;

  readonly accuracy = 0.3;

  readonly criticalChance = 0.8;

  readonly criticalDamageModifier = 1.2;

  readonly name: string;

  readonly rarity: ItemRarity;

  constructor(rarity: ItemRarity = 'COMMON') {
    super();
    this.rarity = rarity;
    const rarityMultiplier = itemRarity[rarity];
    this.attackDamage = 1 + 0.5 * Math.floor(rarityMultiplier / 2);
    this.name = `ржавый меч[${rarity}]`;
  }
}

export class RustedAxeWeapon extends Weapon {
  readonly type = 'AXE';

  readonly subtype = 'ONE_HAND';

  readonly attackDamage: number;

  readonly accuracy = 0.5;

  readonly criticalChance = 0.2;

  readonly criticalDamageModifier = 1.75;

  readonly name: string;

  readonly rarity: ItemRarity;

  constructor(rarity: ItemRarity = 'COMMON') {
    super();
    this.rarity = rarity;
    const rarityMultiplier = itemRarity[rarity];
    this.attackDamage = 0.6 + 0.2 * rarityMultiplier;
    this.name = `ржавый топор[${rarity}]`;
  }
}
