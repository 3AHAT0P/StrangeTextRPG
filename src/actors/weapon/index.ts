/* eslint-disable max-classes-per-file */
export type WeaponType = 'FIST' | 'KNIFE' | 'STONE' | 'SHIELD' | 'SWORD' | 'AXE' | 'TEETH' | 'PAWS' | 'NONE';
export type WeaponSubtype = 'ONE_HAND' | 'TWO_HAND' | 'THROWABLE' | 'ESPECIAL';

export abstract class Weapon {
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
}

export class TeethWeapon extends Weapon {
  readonly type = 'TEETH';

  readonly subtype = 'ESPECIAL';

  readonly attackDamage = 0.4;

  readonly accuracy = 0.6;

  readonly criticalChance = 0.4;

  readonly criticalDamageModifier = 2;

  readonly name = 'острые зубы';
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
}

export class FistWeapon extends Weapon {
  readonly type = 'FIST';

  readonly subtype = 'ESPECIAL';

  readonly attackDamage = 0.3;

  readonly accuracy = 0.8;

  readonly criticalChance = 0.8;

  readonly criticalDamageModifier = 1.4;

  readonly name = 'кулаки';
}

export class KnifeWeapon extends Weapon {
  readonly type = 'KNIFE';

  readonly subtype = 'ONE_HAND';

  readonly attackDamage = 2;

  readonly accuracy = 0.6;

  readonly criticalChance = 0.4;

  readonly criticalDamageModifier = 2;

  readonly name = 'обычный нож';
}

export class RustedSwordWeapon extends Weapon {
  readonly type = 'SWORD';

  readonly subtype = 'ONE_HAND';

  readonly attackDamage = 1;

  readonly accuracy = 0.3;

  readonly criticalChance = 0.8;

  readonly criticalDamageModifier = 1.2;

  readonly name = 'ржавый меч';
}

export class RustedAxeWeapon extends Weapon {
  readonly type = 'AXE';

  readonly subtype = 'ONE_HAND';

  readonly attackDamage = 0.8;

  readonly accuracy = 0.5;

  readonly criticalChance = 0.2;

  readonly criticalDamageModifier = 1.75;

  readonly name = 'ржавый топор';
}
