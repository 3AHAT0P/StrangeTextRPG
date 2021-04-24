import { capitalise } from "../utils/capitalise";

import { AbstractActor, TypeByDeclensionOfNounOptions } from "./AbstractActor";

export const PlayerDeclensionOfNouns = {
  nominative: 'ты',
  genitive: 'тебя',
  dative: 'тебе',
  accusative: 'тебя',
  ablative: 'тобой',
  prepositional: 'о тебе',
}

export class Player extends AbstractActor {
  public type: string = 'player';

  public healthPoints: number;
  public armor: number;

  public attackDamage: number;
  public criticalChance: number;
  public criticalDamageModifier: number = 2;
  public accuracy: number;

  constructor() {
    super();

    this.healthPoints = 10;
    this.armor = 0.2;
    this.attackDamage = 1;
    this.criticalChance = .2;
    this.accuracy = .8;
  }

  public getTypeByDeclensionOfNoun({ declension, plural = false }: TypeByDeclensionOfNounOptions): string {
    return PlayerDeclensionOfNouns[declension];
  }

  public getDeathMessage(): string {
    return `${capitalise(this.getTypeByDeclensionOfNoun({ declension: 'nominative' }))} умер!`;
  }
}
