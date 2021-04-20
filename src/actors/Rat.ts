import { capitalise } from "../utils/capitalise";
import { AbstractActor, DeclensionOfNouns } from "./AbstractActor";

export const RatDeclensionOfNouns = {
  nominative: 'крыса',
  genitive: 'крысу',
  dative: 'крысе',
  accusative: 'крысу',
  ablative: 'крысой',
  prepositional: 'о крысе',
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
    this.armor = 0.4;
    this.attackDamage = 1;
    this.criticalChance = .05;
    this.accuracy = .6;
  }

  public getTypeByDeclensionOfNoun(declension: DeclensionOfNouns): string {
    return RatDeclensionOfNouns[declension];
  }

  public getDeathMessage(): string {
    return `${capitalise(this.getTypeByDeclensionOfNoun('nominative'))} сдохла, жалобно пища!`;
  }
}
