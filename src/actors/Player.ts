import { capitalise } from "../utils/capitalise";

import { AbstractActor, AbstractActorOptions, TypeByDeclensionOfNounOptions } from "./AbstractActor";

export const PlayerDeclensionOfNouns = {
  nominative: 'ты',
  genitive: 'тебя',
  dative: 'тебе',
  accusative: 'тебя',
  ablative: 'тобой',
  prepositional: 'о тебе',

  possessive: 'твои',
}

export class Player extends AbstractActor {
  public type: string = 'player';

  public healthPoints: number;
  public armor: number;

  public attackDamage: number;
  public criticalChance: number;
  public criticalDamageModifier: number = 2;
  public accuracy: number;

  constructor(options: AbstractActorOptions = {}) {
    super(options);

    this.maxHealthPoints = 10;
    this.healthPoints = 8;
    this.armor = 0.2;
    this.attackDamage = 1;
    this.criticalChance = .2;
    this.accuracy = .8;
  }

  public getType({ declension, capitalised = false }: TypeByDeclensionOfNounOptions): string {
    if (capitalised) return capitalise(PlayerDeclensionOfNouns[declension]);

    return PlayerDeclensionOfNouns[declension];
  }

  public getDeathMessage(): string {
    return `${this.getType({ declension: 'nominative', capitalised: true })} умер!`;
  }
}
