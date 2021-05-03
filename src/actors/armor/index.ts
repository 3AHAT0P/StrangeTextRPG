export type HeadArmorType = 'HELMET' | 'HOOD' | 'HAT';
export type NeckArmorType = 'NECKLE';
export type BodyArmorType = 'CHEST' | 'CUIRASS' | 'JACKET' | 'COAT' | 'LEATHER';
export type HandsArmorType = 'GLOVES' | 'GAUNTLETS';
export type FingersArmorType = 'RING';
export type LegsArmorType = 'TROUSERS';
export type FeetArmorType = 'BOOTS' | 'SABATONS';

export type ArmorType = HeadArmorType | NeckArmorType | BodyArmorType | HandsArmorType | FingersArmorType | LegsArmorType | FeetArmorType;
export type ArmorSubtype = 'LIGHT' | 'HEAVY';

export abstract class Armor {
  abstract type: ArmorType;
  abstract subtype: ArmorSubtype;
  abstract armor: number;
}

export abstract class HeadArmor extends Armor {
  abstract type: HeadArmorType;
}

export abstract class NeckArmor extends Armor {
  abstract type: NeckArmorType;
}

export abstract class BodyArmor extends Armor {
  abstract type: BodyArmorType;
}

export abstract class HandsArmor extends Armor {
  abstract type: HandsArmorType;
}

export abstract class FingersArmor extends Armor {
  abstract type: FingersArmorType;
}

export abstract class LegsArmor extends Armor {
  abstract type: LegsArmorType;
}

export abstract class FeetArmor extends Armor {
  abstract type: FeetArmorType;
}

export class LeatherBodyArmor extends BodyArmor {
  readonly type = 'LEATHER';
  readonly subtype = 'LIGHT';
  readonly armor = .1;
}

export class CanvasCoatBodyArmor extends Armor {
  readonly type = 'COAT';
  readonly subtype = 'LIGHT';
  readonly armor = .1;
}

export class CanvasTrousersLegsArmor extends LegsArmor {
  readonly type = 'TROUSERS';
  readonly subtype = 'LIGHT';
  readonly armor = .1;
}
