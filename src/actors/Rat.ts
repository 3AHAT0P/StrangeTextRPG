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
  public nounPostfix: string;

  constructor(props?: { nounPostfix: string }) {
    super();

    this.healthPoints = 5;
    this.armor = 0.1;
    this.attackDamage = .4;
    this.criticalChance = .4;
    this.accuracy = .6;
    this.nounPostfix = props != null ? props.nounPostfix: '';
  }

  public getTypeByDeclensionOfNoun(declension: DeclensionOfNouns, plural: boolean = false, hasPostfix = true): string {
    const noun = plural ? RatDeclensionOfNounsPlural[declension] : RatDeclensionOfNouns[declension];
    return this.nounPostfix && hasPostfix ? `${noun} ${this.nounPostfix}` : noun;
  }

  public getDeathMessage(): string {
    return `${capitalise(this.getTypeByDeclensionOfNoun('nominative'))} сдохла, жалобно пища!`;
  }
}
