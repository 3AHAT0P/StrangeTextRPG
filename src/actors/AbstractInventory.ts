import { Armor } from '@armor';
import { Weapon } from '@weapon';
import { AbstractItem } from '@actors/AbstractItem';

export abstract class AbstractInventory {
  protected armors: Armor[] = [];

  protected weapons: Weapon[] = [];

  protected potions: AbstractItem[] = [];

  protected others: AbstractItem[] = [];

  protected _wearingEquipment: unknown;
}
