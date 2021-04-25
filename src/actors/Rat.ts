import { capitalise } from "../utils/capitalise";
import { getRandomIntInclusive } from "../utils/getRandomIntInclusive";

import { AbstractActor, AbstractActorOptions, RewardBag, TypeByDeclensionOfNounOptions } from "./AbstractActor";

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

export class Rat extends AbstractActor {
  public type = 'крыса';

  public healthPoints: number;
  public armor: number;

  public attackDamage: number;
  public criticalChance: number;
  public criticalDamageModifier: number = 2;
  public accuracy: number;

  constructor(options: AbstractActorOptions = {}) {
    super(options);

    this.maxHealthPoints = 5;
    this.healthPoints = 5;
    this.armor = 0.1;
    this.attackDamage = .4;
    this.criticalChance = .4;
    this.accuracy = .6;
  }

  public getType(
    { declension, plural = false, withPostfix = false, capitalised = false }: TypeByDeclensionOfNounOptions,
  ): string {
    let result = plural ? RatDeclensionOfNounsPlural[declension] : RatDeclensionOfNouns[declension];

    if (capitalised) result = capitalise(result);
    if (this.typePostfix !== '' && withPostfix) result = `${result} ${this.typePostfix}`

    return '🐀 ' + result;
  }

  public getDeathMessage(): string {
    return `${this.getType({ declension: 'nominative', withPostfix: true, capitalised: true })} сдохла, жалобно пища!`;
  }

  public getReward(): RewardBag {
    return {
      gold: getRandomIntInclusive(0, 10),
    };
  }
}
