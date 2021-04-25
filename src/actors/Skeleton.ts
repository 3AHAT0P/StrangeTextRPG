import { capitalise } from "../utils/capitalise";
import { getRandomIntInclusive } from "../utils/getRandomIntInclusive";

import { AbstractActor, AbstractActorOptions, RewardBag, TypeByDeclensionOfNounOptions } from "./AbstractActor";

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

export class Skeleton extends AbstractActor {
  public type = 'скелет';

  public healthPoints: number;
  public armor: number;

  public attackDamage: number;
  public criticalChance: number;
  public criticalDamageModifier: number = 1.75;
  public accuracy: number;

  constructor(options: AbstractActorOptions = {}) {
    super(options);

    this.maxHealthPoints = 7;
    this.healthPoints = getRandomIntInclusive(3, 7);
    this.armor = 0.3;
    this.attackDamage = .6;
    this.criticalChance = .1;
    this.accuracy = .37;
  }

  public getType(
    { declension, plural = false, withPostfix = false, capitalised = false }: TypeByDeclensionOfNounOptions,
  ): string {
    let result = plural ? SkeletonDeclensionOfNounsPlural[declension] : SkeletonDeclensionOfNouns[declension];

    if (capitalised) result = capitalise(result);
    if (this.typePostfix !== '' && withPostfix) result = `${result} ${this.typePostfix}`

    return '💀 ' + result;
  }

  public getDeathMessage(): string {
    return `${this.getType({ declension: 'nominative', withPostfix: true, capitalised: true })} с треском рассыпался!`;
  }

  public getReward(): RewardBag {
    return {
      gold: getRandomIntInclusive(0, 15),
    };
  }
}
