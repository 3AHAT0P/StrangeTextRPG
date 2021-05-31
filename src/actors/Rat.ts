import { capitalise } from '@utils/capitalise';
import { getRandomIntInclusive } from '@utils/getRandomIntInclusive';
import { returnByChance } from '@utils/returnByChance';

import { Player } from '@actors/Player';
import {
  Miscellanious, RatSkin, RatTail, StrangeFlute,
} from '@actors/miscellanious';
import {
  AbstractActor, AbstractActorOptions, AttackResult, RewardBag, TypeByDeclensionOfNounOptions,
} from './AbstractActor';
import { LeatherBodyArmor } from './armor';
import {
  EmptyWeapon, PawsWeapon, TeethWeapon,
} from './weapon';

export const RatDeclensionOfNouns = {
  nominative: 'крыса',
  genitive: 'крысы',
  dative: 'крысе',
  accusative: 'крысу',
  ablative: 'крысой',
  prepositional: 'о крысе',

  possessive: 'крысы',
};

export const RatDeclensionOfNounsPlural = {
  nominative: 'крысы',
  genitive: 'крыс',
  dative: 'крысам',
  accusative: 'крыс',
  ablative: 'крысами',
  prepositional: 'о крысах',

  possessive: 'крыс',
};

interface RatEquipmentSlots {
  body?: LeatherBodyArmor; // Leather
  jaws?: TeethWeapon; // Teeth
  hands?: PawsWeapon; // Paws
}

export class Rat extends AbstractActor {
  type = 'крыса';

  protected _activeWeapon: TeethWeapon | PawsWeapon | EmptyWeapon;

  get armor(): number { return this._wearingEquipment.body?.armor ?? 0; }

  get attackDamage(): number { return this._activeWeapon.attackDamage; }

  get criticalChance(): number { return this._activeWeapon.criticalChance; }

  get criticalDamageModifier(): number { return this._activeWeapon.criticalDamageModifier; }

  get accuracy(): number { return this._activeWeapon.accuracy; }

  _wearingEquipment: RatEquipmentSlots = {
    body: new LeatherBodyArmor(),
    jaws: new TeethWeapon(),
    hands: new PawsWeapon(),
  };

  constructor(options: AbstractActorOptions = {}) {
    super(options);

    this.maxHealthPoints = 5;
    this.healthPoints = 5;

    this._activeWeapon = this._wearingEquipment.jaws ?? new EmptyWeapon();
  }

  public doAttack(enemy: AbstractActor): AttackResult {
    this._activeWeapon = returnByChance<TeethWeapon | PawsWeapon | undefined>(
      [[this._wearingEquipment.hands, 0.5], [this._wearingEquipment.jaws, 1]],
    )[0] ?? new EmptyWeapon();

    return super.doAttack(enemy);
  }

  public getType(
    {
      declension, plural = false, withPostfix = false, capitalised = false,
    }: TypeByDeclensionOfNounOptions,
  ): string {
    let result = plural ? RatDeclensionOfNounsPlural[declension] : RatDeclensionOfNouns[declension];

    if (capitalised) result = capitalise(result);
    if (this.typePostfix !== '' && withPostfix) result = `${result} ${this.typePostfix}`;

    return `🐀 ${result}`;
  }

  public getDeathMessage(): string {
    return `${this.getType({ declension: 'nominative', withPostfix: true, capitalised: true })} сдохла, жалобно пища!`;
  }

  public getReward(player: Player): RewardBag {
    const holdWeapon = player.wearingEquipment.rightHand;
    if (holdWeapon?.type === 'KNIFE') {
      const loot = [{
        item: new RatSkin(),
        minAmount: 1,
        maxAmount: 3,
        chance: 0.6,
      }, {
        item: new RatTail(),
        minAmount: 1,
        maxAmount: 1,
        chance: 0.35,
      }, {
        item: new StrangeFlute(),
        minAmount: 1,
        maxAmount: 1,
        chance: 0.05,
      }];
      const roulete = loot.map(({ item, chance }) => ([item, chance]));
      // @ts-ignore
      const test = returnByChance<RatSkin | RatTail | StrangeFlute>(roulete);
      console.log('loot', loot)
      console.log('roulete', roulete)
      console.log('return', test)
    }
    return {
      gold: getRandomIntInclusive(0, 10),
    };
  }
}
