import { getRandomIntInclusive } from '@utils/getRandomIntInclusive';
import { Weapon } from '@weapon';
import { AbstractInventory } from '@actors/AbstractInventory';

export interface AttackResult {
  damage: number;
  isAlive: boolean;
  isCritical: boolean;
  isMiss: boolean;
}

export interface Bag {
  healthPoitions: number;
}

export interface RewardBag {
  gold?: number;
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

  protected _gold: number = 0;

  protected _bag: Bag = { healthPoitions: 0 };

  protected abstract inventory: AbstractInventory;

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

  get gold(): number {
    return this._gold;
  }

  get healthPoitions(): number {
    return this._bag.healthPoitions;
  }

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

  public useHealthPoition(): false | number {
    if (this._bag.healthPoitions === 0) return false;

    this._bag.healthPoitions -= 1;
    const healVolume = getRandomIntInclusive(2, 5);
    this.healthPoints += healVolume;

    if (this.healthPoints > this.maxHealthPoints) this.healthPoints = this.maxHealthPoints;

    return healVolume;
  }

  public exchangeGoldToItem(goldCount: number, bag: Partial<Bag>): boolean {
    if (this._gold < goldCount) return false;

    this._gold -= goldCount;
    for (const [item, count] of Object.entries(bag) as Array<[keyof Bag, number]>) {
      this._bag[item] += count;
    }

    return true;
  }

  public getReward(player: AbstractActor): string { return ''; } // @TODO: Update return type when Inventory will be completed

  public collectRewards(): void {

  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public collectReward(reward: RewardBag): void { /* pass */ }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public equipWeapon(weapon: Weapon, hand: 'LEFT' | 'RIGHT' = 'RIGHT'): boolean { return true; }
}
