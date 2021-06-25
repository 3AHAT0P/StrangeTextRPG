import type { AbstractInventory } from '@actors/AbstractInventory';
import type { AbstractItem } from '@actors/AbstractItem';
import type { Weapon } from '@weapon';

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
  protected type: string = 'unknown';

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

  public abstract getType(options: TypeByDeclensionOfNounOptions): string;

  public abstract getDeathMessage(): string;

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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public equipWeapon(weapon: Weapon, hand: 'LEFT' | 'RIGHT' = 'RIGHT'): void { /* pass */ }

  public heal(quantity: number): void {
    this.healthPoints += quantity;
    if (this.healthPoints > this.maxHealthPoints) this.healthPoints = this.maxHealthPoints;
  }
}
