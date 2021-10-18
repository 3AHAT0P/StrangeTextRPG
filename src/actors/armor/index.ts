/* eslint-disable max-classes-per-file */
import { AbstractItem } from '@actors/AbstractItem';
import type { AbstractActor } from '@actors/AbstractActor';

export type HeadArmorType = 'HELMET' | 'HOOD' | 'HAT';
export type NeckArmorType = 'NECKLE';
export type BodyArmorType = 'CHEST' | 'CUIRASS' | 'JACKET' | 'COAT' | 'LEATHER' | 'SKELETON';
export type HandsArmorType = 'GLOVES' | 'GAUNTLETS';
export type FingersArmorType = 'RING';
export type LegsArmorType = 'TROUSERS';
export type FeetArmorType = 'BOOTS' | 'SABATONS';
export type InHandArmorType = 'SHIELD';

export type ArmorType = HeadArmorType | NeckArmorType | BodyArmorType | HandsArmorType
| FingersArmorType | LegsArmorType | FeetArmorType | InHandArmorType;

export type ArmorSubtype = 'LIGHT' | 'HEAVY';

export abstract class Armor extends AbstractItem {
  public abstract type: ArmorType;

  public abstract subtype: ArmorSubtype;

  public abstract armor: number;

  public customEffects?: {
    health: number;
  };

  // TODO make equip armor
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public use(target: AbstractActor) {
    target.equipArmor(this);
    return `${target.getType({ declension: 'nominative', capitalised: true })} надеваешь ${this.name}`;
  }
}

export abstract class HeadArmor extends Armor {
  public abstract type: HeadArmorType;
}

export abstract class NeckArmor extends Armor {
  public abstract type: NeckArmorType;
}

export abstract class BodyArmor extends Armor {
  public abstract type: BodyArmorType;
}

export abstract class HandsArmor extends Armor {
  public abstract type: HandsArmorType;
}

export abstract class FingersArmor extends Armor {
  public abstract type: FingersArmorType;
}

export abstract class LegsArmor extends Armor {
  public abstract type: LegsArmorType;
}

export abstract class FeetArmor extends Armor {
  public abstract type: FeetArmorType;
}

export abstract class InHandArmor extends Armor {
  public abstract type: InHandArmorType;
}

export class LeatherBodyArmor extends BodyArmor {
  protected readonly baseName = 'шкура';

  protected readonly basePrice = 5;

  public readonly type = 'LEATHER';

  public readonly subtype = 'LIGHT';

  public readonly armor = 0.1;
}

export class StrongBonesBodyArmor extends BodyArmor {
  protected readonly baseName = 'твердые кости';

  protected readonly basePrice = 5;

  public readonly type = 'SKELETON';

  public readonly subtype = 'LIGHT';

  public readonly armor = 0.1;
}

export class CanvasCoatBodyArmor extends BodyArmor {
  protected readonly baseName = 'поношеная куртка из грубой парусины';

  protected readonly basePrice = 0;

  public readonly type = 'COAT';

  public readonly subtype = 'LIGHT';

  public readonly armor = 0.1;
}

export class CanvasTrousersLegsArmor extends LegsArmor {
  protected readonly baseName = 'поношеные штаны из грубой парусины';

  protected readonly basePrice = 0;

  public readonly type = 'TROUSERS';

  public readonly subtype = 'LIGHT';

  public readonly armor = 0.1;
}

export class BrokenShieldArmor extends InHandArmor {
  protected readonly baseName = 'старый сломаный щит';

  protected readonly basePrice = 3;

  public readonly type = 'SHIELD';

  public readonly subtype = 'LIGHT';

  public readonly armor = 0.2;
}

export class UniqueOldFamilyRingArmor extends FingersArmor {
  protected readonly baseName = 'старинное фамильное кольцо с рубином';

  protected readonly basePrice = 30;

  public readonly type = 'RING';

  public readonly subtype = 'LIGHT';

  public readonly armor = 0;

  public readonly customEffects = {
    health: 20,
  };
}
