import { capitalise } from "../utils/capitalise";
import { AbstractActor, DeclensionOfNouns } from "./AbstractActor";

export const RatDeclensionOfNouns = {
  nominative: 'крыса',
  genitive: 'крысы',
  dative: 'крысе',
  accusative: 'крысу',
  ablative: 'крысой',
  prepositional: 'о крысе',
};

export const RatDeclensionOfNounsPlural = {
  nominative: 'крысы',
  genitive: 'крыс',
  dative: 'крысам',
  accusative: 'крыс',
  ablative: 'крысами',
  prepositional: 'о крысах',
};

export class Rat extends AbstractActor {
  public healthPoints: number;
  public armor: number;

  public attackDamage: number;
  public criticalChance: number;
  public criticalDamageModifier: number = 2;
  public accuracy: number;

  constructor() {
    super();

    this.healthPoints = 5;
    this.armor = 0.1;
    this.attackDamage = .4;
    this.criticalChance = .4;
    this.accuracy = .6;
  }

  public getTypeByDeclensionOfNoun(declension: DeclensionOfNouns, plural: boolean = false): string {
    if (plural) return RatDeclensionOfNounsPlural[declension];
    return RatDeclensionOfNouns[declension];
  }

  public getDeathMessage(): string {
    return `${capitalise(this.getTypeByDeclensionOfNoun('nominative'))} сдохла, жалобно пища!`;
  }
}
