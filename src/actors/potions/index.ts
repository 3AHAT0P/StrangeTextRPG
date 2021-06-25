/* eslint-disable max-classes-per-file */
import { AbstractItem } from '@actors/AbstractItem';
import { MESSAGES } from '@translations/ru';
import type { AbstractActor } from '@actors';

export type PotionTypes = 'HEALTH' | 'ATTACK_DAMAGE' | 'CRITICAL_CHANCE' | 'ARMOR';

export type PotionSubtypes = 'SMALL' | 'MEDIUM' | 'BIG';

export type HealthStatusEffects = 'RESTORE' | 'INCREASE' | 'REGENERATION';

export type PotionStatusEffects = HealthStatusEffects;

export abstract class Potion extends AbstractItem {
  protected abstract baseName: string;

  public abstract type: PotionTypes;

  public abstract statusEffect: PotionStatusEffects;

  public abstract get description(): string;

  public abstract quantity: number;

  public subtype: PotionSubtypes = 'SMALL';

  public get name(): string {
    return `${this.baseName} [${MESSAGES.potions[this.subtype]}]`;
  }
}

export class HealthPotion extends Potion {
  protected readonly baseName = 'зелье лечения';

  public readonly type = 'HEALTH';

  public readonly statusEffect = 'RESTORE';

  public get description() {
    return `Баночка с красным, мутным зельем.\nЕсли выпить, восстановит ${this.quantity} ОЗ`;
  }

  public quantity = 2;

  constructor(options: { subtype: PotionSubtypes } = { subtype: 'SMALL' }) {
    super();
    this.subtype = options.subtype;
    if (options.subtype === 'MEDIUM') this.quantity = 3;
    if (options.subtype === 'BIG') this.quantity = 5;
  }

  use(player: AbstractActor): string {
    player.heal(this.quantity);
    return `Оно восстанавливает ${player.getType({ declension: 'dative' })} ${this.quantity} ОЗ(❤️). Всего у ${player.getType({ declension: 'genitive' })} ${player.stats.healthPoints} из ${player.stats.maxHealthPoints} ОЗ(❤️)`;
  }
}
