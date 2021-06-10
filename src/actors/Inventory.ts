import { AbstractInventory } from '@actors/AbstractInventory';

export class Inventory<T> extends AbstractInventory {
  protected _wearingEquipment: T;

  constructor({ defaultEquipment, gold }: { defaultEquipment: T, gold?: number }) {
    super();
    this._wearingEquipment = defaultEquipment;
    if (gold != null) this._gold = gold;
  }

  public get wearingEquipment(): T { return this._wearingEquipment; }
}
