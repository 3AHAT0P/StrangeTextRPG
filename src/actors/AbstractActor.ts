import type { AbstractInventory } from '@actors/AbstractInventory';
import type { AbstractItem } from '@actors/AbstractItem';
import { capitalise } from '@utils/capitalise';
import type { Weapon } from '@weapon';
import { Armor, InHandArmor } from './armor';

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
  protected abstract type: string;

  protected declensionOfNouns: Record<DeclensionOfNouns, string> = {
    nominative: 'undefined',
    genitive: 'undefined',
    dative: 'undefined',
    accusative: 'undefined',
    ablative: 'undefined',
    prepositional: 'undefined',

    possessive: 'undefined',
  };

  protected typePostfix: string = '';

  protected maxHealthPoints: number = 0;

  protected healthPoints: number = 0;

  protected abstract armor: number;

  protected abstract attackDamage: number;

  protected abstract criticalChance: number;

  protected abstract criticalDamageModifier: number;

  protected abstract accuracy: number;

  abstract inventory: AbstractInventory;

  get stats() {
    return {
      maxHealthPoints: this.maxHealthPoints,
      healthPoints: this.healthPoints,
      armor: this.armor,
      attackDamage: this.attackDamage,
      criticalChance: this.criticalChance,
      criticalDamageModifier: this.criticalDamageModifier,
      accuracy: this.accuracy,
    };
  }

  public get isAlive(): boolean { return this.healthPoints > 0; }

  constructor(options: AbstractActorOptions = {}) {
    if (options.typePostfix != null && options.typePostfix !== '') this.typePostfix = options.typePostfix;
  }

  public getType({ declension, capitalised = false }: TypeByDeclensionOfNounOptions): string {
    if (capitalised) return capitalise(this.declensionOfNouns[declension]);

    return this.declensionOfNouns[declension];
  }

  public getDeathMessage(): string {
    return `${this.getType({ declension: 'nominative', capitalised: true })} умер!`;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public exchangeGoldToItem(goldCount: number, items: AbstractItem[]) { return false; }

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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public getReward(player: AbstractActor): string { return ''; }

  public abstract equipWeapon(weapon: Weapon | InHandArmor): void;

  public abstract equipArmor(armor: Armor): void;

  public heal(quantity: number): void {
    this.healthPoints += quantity;
    if (this.healthPoints > this.maxHealthPoints) this.healthPoints = this.maxHealthPoints;
  }
}
