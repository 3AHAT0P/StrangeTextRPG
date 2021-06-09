import { AbstractInventory } from '@actors/AbstractInventory';

export class Inventory<T> extends AbstractInventory {
  protected _wearingEquipment: T;

  constructor({ defaultEquipment }: { defaultEquipment: T }) {
    super();
    this._wearingEquipment = defaultEquipment;
  }

  public get wearingEquipment(): T { return this._wearingEquipment; }
}
