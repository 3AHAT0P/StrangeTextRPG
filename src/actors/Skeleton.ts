import { capitalise } from '@utils/capitalise';
import { getRandomIntInclusive } from '@utils/getRandomIntInclusive';
import { truncate } from '@utils/math';
import { returnByChance } from '@utils/returnByChance';

import {
  AbstractActor, AbstractActorOptions, RewardBag, TypeByDeclensionOfNounOptions,
} from './AbstractActor';
import { BrokenShieldArmor, StrongBonesBodyArmor } from './armor';
import { EmptyWeapon, RustedAxeWeapon, RustedSwordWeapon } from './weapon';

export const SkeletonDeclensionOfNouns = {
  nominative: 'скелет',
  genitive: 'скелета',
  dative: 'скелету',
  accusative: 'скелет',
  ablative: 'скелетом',
  prepositional: 'о скелете',

  possessive: 'скелета',
};

export const SkeletonDeclensionOfNounsPlural = {
  nominative: 'скелеты',
  genitive: 'скелетов',
  dative: 'скелетам',
  accusative: 'скелеты',
  ablative: 'скелетами',
  prepositional: 'о скелетах',

  possessive: 'скелетов',
};

interface SkeletonEquipmentSlots {
  body?: StrongBonesBodyArmor;
  leftHand?: BrokenShieldArmor;
  rightHand: RustedAxeWeapon | RustedSwordWeapon | EmptyWeapon;
}

// TODO:
export class Skeleton extends AbstractActor {
  public type = 'скелет';

  get armor(): number {
    return truncate((this._wearingEquipment.body?.armor ?? 0) + (this._wearingEquipment.leftHand?.armor ?? 0), 2);
  }

  get attackDamage(): number { return this._wearingEquipment.rightHand.attackDamage; }

  get criticalChance(): number { return this._wearingEquipment.rightHand.criticalChance; }

  get criticalDamageModifier(): number { return this._wearingEquipment.rightHand.criticalDamageModifier; }

  get accuracy(): number { return this._wearingEquipment.rightHand.accuracy; }

  _wearingEquipment: SkeletonEquipmentSlots = {
    body: new StrongBonesBodyArmor(),
    leftHand: returnByChance([[new BrokenShieldArmor(), 0.5], [void 0, 1]])[0],
    rightHand: returnByChance<RustedSwordWeapon | RustedAxeWeapon | EmptyWeapon>(
      [[new RustedAxeWeapon(), 0.6], [new RustedSwordWeapon(), 0.8], [new EmptyWeapon(), 1]],
    )[0],
  };

  constructor(options: AbstractActorOptions = {}) {
    super(options);

    this.maxHealthPoints = 7;
    // Когда скелеты восстают из могил, или откуда там они восстают
    // У них хп не полные. Зависит от стеени разложения, количества местных собак и т.д.
    this.healthPoints = getRandomIntInclusive(3, 7);
  }

  public getType(
    {
      declension, plural = false, withPostfix = false, capitalised = false,
    }: TypeByDeclensionOfNounOptions,
  ): string {
    let result = plural ? SkeletonDeclensionOfNounsPlural[declension] : SkeletonDeclensionOfNouns[declension];

    if (capitalised) result = capitalise(result);
    if (this.typePostfix !== '' && withPostfix) result = `${result} ${this.typePostfix}`;

    return `💀 ${result}`;
  }

  public getDeathMessage(): string {
    return `${this.getType({ declension: 'nominative', withPostfix: true, capitalised: true })} с треском рассыпался!`;
  }

  public getReward(): RewardBag {
    return {
      gold: getRandomIntInclusive(2, 15),
    };
  }
}
