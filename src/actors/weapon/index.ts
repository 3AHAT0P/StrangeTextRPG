export type WeaponType = 'FIST' | 'KNIFE' | 'STONE' | 'SHIELD' | 'TEETH' | 'PAWS' | 'NONE';
export type WeaponSubtype = 'ONE_HAND' | 'TWO_HAND' | 'THROWABLE' | 'ESPECIAL';

export abstract class Weapon {
  abstract type: WeaponType;
  abstract subtype: WeaponSubtype;
  abstract attackDamage: number;
  abstract accuracy: number;
  abstract criticalChance: number;
  abstract criticalDamageModifier: number;
}

export class EmptyWeapon extends Weapon {
  readonly type = 'NONE';
  readonly subtype = 'ESPECIAL';
  readonly attackDamage = 0;
  readonly accuracy = 0;
  readonly criticalChance = 0;
  readonly criticalDamageModifier = 0;
}

export class TeethWeapon extends Weapon {
  readonly type = 'TEETH';
  readonly subtype = 'ESPECIAL';
  readonly attackDamage = .4;
  readonly accuracy = .6;
  readonly criticalChance = .4;
  readonly criticalDamageModifier = 2;
}

// add attack number (2 for this)
export class PawsWeapon extends Weapon {
  readonly type = 'PAWS';
  readonly subtype = 'ESPECIAL';
  readonly attackDamage = .6;
  readonly accuracy = .4;
  readonly criticalChance = .2;
  readonly criticalDamageModifier = 2;
}

export class FistWeapon extends Weapon {
  readonly type = 'FIST';
  readonly subtype = 'ESPECIAL';
  readonly attackDamage = .3;
  readonly accuracy = .8;
  readonly criticalChance = .8;
  readonly criticalDamageModifier = 1.4;
}

export class KnifeWeapon extends Weapon {
  readonly type = 'KNIFE';
  readonly subtype = 'ONE_HAND';
  readonly attackDamage = 2;
  readonly accuracy = .6;
  readonly criticalChance = .4;
  readonly criticalDamageModifier = 2;
}