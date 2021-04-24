export interface AttackResult {
  damage: number;
  isAlive: boolean;
  isCritical: boolean;
  isMiss: boolean;
}

export interface AbstractActorOptions {
  typePostfix?: string;
}

export interface TypeByDeclensionOfNounOptions {
  declension: DeclensionOfNouns;
  plural?: boolean;
  withPostfix?: boolean;
  capitalised?: boolean;
}

export type DeclensionOfNouns =
  'nominative' |
  'genitive' |
  'dative' |
  'accusative' |
  'ablative' |
  'prepositional' |
  'possessive';

export abstract class AbstractActor {
  public type: string = 'unknown';
  public typePostfix: string = '';

  public maxHealthPoints: number = 0;
  public healthPoints: number = 0;
  public armor: number = 0;

  public attackDamage: number = 0;
  public criticalChance: number = 0;
  public criticalDamageModifier: number = 2;
  public accuracy: number = .8;

  public get isAlive(): boolean { return this.healthPoints > 0; }

  constructor(options: AbstractActorOptions = {}) {
    if (options.typePostfix != null && options.typePostfix !== '') this.typePostfix = options.typePostfix;
  }

  public abstract getType(options: TypeByDeclensionOfNounOptions): string;
  public abstract getDeathMessage(): string;

  public doAttack(enemy: AbstractActor): AttackResult {
    if (Math.random() >= (1 - this.accuracy)) { // мы попали
      if (Math.random() >= 1 - this.criticalChance) { // кританули
        return {
          ...enemy.takeDamage(this.attackDamage * this.criticalDamageModifier),
          isCritical: true,
        };
      }
      return enemy.takeDamage(this.attackDamage);
    }
    return {
      damage: 0,
      isAlive: true,
      isCritical: false,
      isMiss: true,
    };
  }

  public takeDamage(damage: number): AttackResult {
    const trueDamage = Math.round((damage - this.armor) * 100) / 100;
    if (trueDamage > 0) this.healthPoints = Math.round((this.healthPoints - trueDamage) * 100) / 100;
    return {
      damage: trueDamage,
      isAlive: this.healthPoints > 0, // возвращаем жив ли еще actor или нет
      isCritical: false,
      isMiss: false,
    };
  }
}
