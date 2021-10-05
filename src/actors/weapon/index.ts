/* eslint-disable max-classes-per-file */
import { AbstractItem, itemRarity, ItemRarity } from '@actors/AbstractItem';
import type { AbstractActor } from '@actors';

export type WeaponType = 'FIST' | 'KNIFE' | 'STONE' | 'SHIELD' | 'SWORD' | 'AXE' | 'TEETH' | 'PAWS' | 'NONE';
export type WeaponSubtype = 'ONE_HAND' | 'TWO_HAND' | 'THROWABLE' | 'ESPECIAL';

export abstract class Weapon extends AbstractItem {
  public professions: any = {};

  public abstract type: WeaponType;

  public abstract subtype: WeaponSubtype;

  public abstract attackDamage: number;

  public abstract accuracy: number;

  public abstract criticalChance: number;

  public abstract criticalDamageModifier: number;

  // TODO make equip weapon
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public use(target: AbstractActor) {
    target.equipWeapon(this);
    return `${target.getType({ declension: 'nominative', capitalised: true })} надеваешь ${this.name}`;
  }
}

export class EmptyWeapon extends Weapon {
  protected readonly baseName = 'ничего';

  public readonly type = 'NONE';

  public readonly subtype = 'ESPECIAL';

  public readonly attackDamage: number = 0;

  public readonly accuracy: number = 0;

  public readonly criticalChance: number = 0;

  public readonly criticalDamageModifier: number = 0;
}

export class TeethWeapon extends Weapon {
  protected readonly baseName = 'острые зубы';

  public readonly type = 'TEETH';

  public readonly subtype = 'ESPECIAL';

  public readonly attackDamage: number = 0.4;

  public readonly accuracy: number = 0.6;

  public readonly criticalChance: number = 0.4;

  public readonly criticalDamageModifier: number = 2;
}

// add attack number (2 for this)
export class PawsWeapon extends Weapon {
  protected readonly baseName = 'острые когти';

  public readonly type = 'PAWS';

  public readonly subtype = 'ESPECIAL';

  public readonly attackDamage: number = 0.6;

  public readonly accuracy: number = 0.4;

  public readonly criticalChance: number = 0.2;

  public readonly criticalDamageModifier: number = 2;
}

export class FistWeapon extends Weapon {
  protected readonly baseName = 'кулаки';

  public readonly type = 'FIST';

  public readonly subtype = 'ESPECIAL';

  public readonly attackDamage: number = 0.3;

  public readonly accuracy: number = 0.8;

  public readonly criticalChance: number = 0.8;

  public readonly criticalDamageModifier: number = 1.4;
}

export class KnifeWeapon extends Weapon {
  protected readonly baseName: string = 'нож';

  public readonly professions = <const>{ skinning: 1 };

  public readonly type = 'KNIFE';

  public readonly subtype = 'ONE_HAND';

  public readonly attackDamage: number;

  public readonly accuracy: number = 0.6;

  public readonly criticalChance: number;

  public readonly criticalDamageModifier: number = 2;

  constructor(rarity: ItemRarity = 'COMMON') {
    super(rarity);
    const rarityMultiplier = itemRarity[rarity];
    this.attackDamage = 0.5 + 0.5 * rarityMultiplier;
    this.criticalChance = 0.4 + 0.1 * Math.floor(rarityMultiplier / 2);
  }
}

export class RustedSwordWeapon extends Weapon {
  protected readonly baseName: string = 'ржавый меч';

  readonly type = 'SWORD';

  readonly subtype = 'ONE_HAND';

  readonly attackDamage: number;

  readonly accuracy: number = 0.3;

  readonly criticalChance: number = 0.8;

  readonly criticalDamageModifier: number = 1.2;

  constructor(rarity: ItemRarity = 'COMMON') {
    super(rarity);
    const rarityMultiplier = itemRarity[rarity];
    this.attackDamage = 1 + 0.5 * Math.floor(rarityMultiplier / 2);
  }
}

export class RustedAxeWeapon extends Weapon {
  protected readonly baseName: string = 'ржавый топор';

  readonly type = 'AXE';

  readonly subtype = 'ONE_HAND';

  readonly attackDamage: number;

  readonly accuracy: number = 0.5;

  readonly criticalChance: number = 0.2;

  readonly criticalDamageModifier: number = 1.75;

  constructor(rarity: ItemRarity = 'COMMON') {
    super(rarity);
    const rarityMultiplier = itemRarity[rarity];
    this.attackDamage = 0.6 + 0.2 * rarityMultiplier;
  }
}
