import { Armor } from '@armor';
import { Weapon } from '@weapon';
import { AbstractItem } from '@actors/AbstractItem';
import { Miscellaneous } from '@actors/miscellaneous';
import { Potion } from '@actors/potions';

export abstract class AbstractInventory {
  protected _gold: number = 0;

  protected _armors: Armor[] = [];

  protected _weapons: Weapon[] = [];

  protected _potions: AbstractItem[] = [];

  protected _miscellaneous: Miscellaneous[] = [];

  protected _wearingEquipment: unknown;

  public get armors(): Armor[] { return this._armors; }

  public get weapons(): Weapon[] { return this._weapons; }

  public get potions(): AbstractItem[] { return this._potions; }

  public get miscellaneous(): Miscellaneous[] { return this._miscellaneous; }

  public collectArmor(item: Armor): void { this._armors.push(item); }

  public collectWeapon(item: Weapon): void { this._weapons.push(item); }

  public collectPotion(item: Potion): void { this._potions.push(item); }

  public collectMiscellaneous(item: Miscellaneous): void { this._miscellaneous.push(item); }

  public collectGold(amount: number): void { this._gold += amount; }
}
