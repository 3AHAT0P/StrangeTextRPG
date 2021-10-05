/* eslint-disable max-classes-per-file */
import { getRandomFloatInclusive } from '@utils/getRandomIntInclusive';
import { AbstractItem } from '@actors/AbstractItem';
import type { AbstractActor } from '@actors';

export type PotionTypes = 'HEALTH' | 'ATTACK_DAMAGE' | 'CRITICAL_CHANCE' | 'ARMOR';

export type HealthStatusEffects = 'RESTORE' | 'INCREASE' | 'REGENERATION';

export type PotionStatusEffects = HealthStatusEffects;

export abstract class Potion extends AbstractItem {
  protected abstract baseName: string;

  public abstract type: PotionTypes;

  public abstract statusEffect: PotionStatusEffects;

  public abstract get description(): string;

  public get name(): string {
    return this.baseName;
  }
}

export abstract class HealingPotion extends Potion {
  public readonly type = 'HEALTH';

  public readonly statusEffect = 'RESTORE';

  public abstract healVolume: number;

  public abstract threshold: number;

  public get description() {
    return 'Баночка с красным, мутным зельем.\n'
      + `Если выпить, восстановит от ${this.healVolume - this.threshold} - до ${this.healVolume + this.threshold} ОЗ(❤️)`;
  }

  use(player: AbstractActor): string {
    const realHealingVolume = getRandomFloatInclusive(
      this.healVolume - this.threshold,
      this.healVolume + this.threshold,
      2,
    );
    player.heal(realHealingVolume);
    return `Оно восстанавливает ${player.getType({ declension: 'dative' })} ${realHealingVolume} ОЗ(❤️). `
      + `Всего у ${player.getType({ declension: 'genitive' })} ${player.stats.healthPoints} из ${player.stats.maxHealthPoints} ОЗ(❤️)`;
  }
}

export class SmallHealingPotion extends HealingPotion {
  protected readonly baseName = 'маленькое зелье лечения';

  protected readonly basePrice = 10;

  public healVolume = 2;

  public threshold = 0.5;
}

export class MediumHealingPotion extends HealingPotion {
  protected readonly baseName = 'зелье лечения';

  protected readonly basePrice = 20;

  public healVolume = 5;

  public threshold = 1.5;
}

export class LargeHealingPotion extends HealingPotion {
  protected readonly baseName = 'большое зелье лечения';

  protected readonly basePrice = 30;

  public healVolume = 10;

  public threshold = 3;
}
