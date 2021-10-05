import { capitalise } from '@utils/capitalise';
import { getRandomIntInclusive } from '@utils/getRandomIntInclusive';
import { truncate } from '@utils/math';
import { Randomizer } from '@utils/Randomizer';
import { BrokenShieldArmor, StrongBonesBodyArmor } from '@armor';
import { EmptyWeapon, RustedAxeWeapon, RustedSwordWeapon } from '@weapon';
import { Inventory } from '@actors/Inventory';

import {
  AbstractActor, AbstractActorOptions, TypeByDeclensionOfNounOptions,
} from '../AbstractActor';

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

export class Skeleton extends AbstractActor {
  protected type = 'скелет';

  protected declensionOfNouns = {
    nominative: 'скелет',
    genitive: 'скелета',
    dative: 'скелету',
    accusative: 'скелет',
    ablative: 'скелетом',
    prepositional: 'о скелете',

    possessive: 'скелета',
  };

  public inventory: Inventory<keyof SkeletonEquipmentSlots, SkeletonEquipmentSlots>;

  get armor(): number {
    return truncate(
      (this.inventory.wearingEquipment.body?.armor ?? 0) + (this.inventory.wearingEquipment.leftHand?.armor ?? 0),
      2,
    );
  }

  get attackDamage(): number { return this.inventory.wearingEquipment.rightHand.attackDamage; }

  get criticalChance(): number { return this.inventory.wearingEquipment.rightHand.criticalChance; }

  get criticalDamageModifier(): number { return this.inventory.wearingEquipment.rightHand.criticalDamageModifier; }

  get accuracy(): number { return this.inventory.wearingEquipment.rightHand.accuracy; }

  constructor(options: AbstractActorOptions = {}) {
    super(options);

    this.inventory = new Inventory({
      defaultEquipment: {
        body: new StrongBonesBodyArmor(),
        leftHand: Randomizer.returnOneFromList([[new BrokenShieldArmor(), 0.5], [void 0, 0.5]]),
        rightHand: Randomizer.returnOneFromList<RustedSwordWeapon | RustedAxeWeapon | EmptyWeapon>(
          [[new RustedAxeWeapon(), 0.3], [new RustedSwordWeapon(), 0.5], [new EmptyWeapon(), 0.2]],
        ),
      },
    });
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
    let result = plural ? SkeletonDeclensionOfNounsPlural[declension] : this.declensionOfNouns[declension];

    if (capitalised) result = capitalise(result);
    if (this.typePostfix !== '' && withPostfix) result = `${result} ${this.typePostfix}`;

    return `💀 ${result}`;
  }

  public getDeathMessage(): string {
    return `${this.getType({ declension: 'nominative', withPostfix: true, capitalised: true })} с треском рассыпался!`;
  }

  public getReward(): string {
    return 'Кости... одни кости';
  }

  public equipWeapon(weapon: BrokenShieldArmor | RustedAxeWeapon | RustedSwordWeapon | EmptyWeapon): void {
    if (weapon instanceof BrokenShieldArmor) this.inventory.equipToSlot('leftHand', weapon);
    if (weapon instanceof RustedAxeWeapon || weapon instanceof RustedSwordWeapon || weapon instanceof EmptyWeapon) {
      this.inventory.equipToSlot('rightHand', weapon);
    }
  }

  public equipArmor(armor: StrongBonesBodyArmor): void {
    if (armor instanceof StrongBonesBodyArmor) this.inventory.equipToSlot('body', armor);
  }
}
