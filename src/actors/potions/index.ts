/* eslint-disable max-classes-per-file */
import { AbstractItem } from '@actors/AbstractItem';
import type { AbstractActor } from '@actors';

export type PotionTypes = 'HEALTH' | 'ATTACK_DAMAGE' | 'CRITICAL_CHANCE' | 'ARMOR';

export type PotionSubtypes = 'SMALL' | 'MEDIUM' | 'BIG';

export type HealthStatusEffects = 'RESTORE' | 'INCREASE' | 'REGENERATION';

export type PotionStatusEffects = HealthStatusEffects;

export abstract class Potion extends AbstractItem {
  protected abstract baseName: string;

  public abstract description: string;

  public abstract type: PotionTypes;

  public abstract subtype: PotionSubtypes;

  public abstract statusEffect: PotionStatusEffects;

  public abstract quantity: number;

  public abstract usePotion(player: AbstractActor): string;
}

export abstract class HealthPotion extends Potion {
  usePotion(player: AbstractActor): string {
    player.heal(this.quantity);
    return `Оно восстанавливает ${player.getType({ declension: 'dative' })} ${this.quantity} ОЗ(❤️). Всего у ${player.getType({ declension: 'genitive' })} ${player.stats.healthPoints} из ${player.stats.maxHealthPoints} ОЗ(❤️)`;
  }
}

export class SmallHealthPotion extends HealthPotion {
  protected readonly baseName = 'малое зелье лечения';

  public readonly type = 'HEALTH';

  public readonly subtype = 'SMALL';

  public readonly statusEffect = 'RESTORE';

  public readonly quantity = 2;

  public readonly description = `Маленькая баночка с красным, мутным зельем.\nЕсли выпить, восстановит ${this.quantity} ОЗ`;
}
