import {Armor, BrokenShieldArmor, CanvasCoatBodyArmor, CanvasTrousersLegsArmor, StrongBonesBodyArmor} from '@armor';
import {RustedSwordWeapon, Weapon} from '@weapon';
import { AbstractItem } from '@actors/AbstractItem';
import { Miscellaneous } from '@actors/miscellaneous';
import { Potion } from '@actors/potions';

export abstract class AbstractInventory {
  protected _gold: number = 0;

  // TODO make it empty as it was before
  protected _armors: Armor[] = [new StrongBonesBodyArmor(), new CanvasTrousersLegsArmor(), new BrokenShieldArmor()];

  protected _weapons: Weapon[] = [new RustedSwordWeapon()];

  protected _potions: AbstractItem[] = [];

  protected _miscellaneous: Miscellaneous[] = [];

  protected _wearingEquipment: unknown;

  public get armors(): Armor[] { return this._armors; }

  public get weapons(): Weapon[] { return this._weapons; }

  public get potions(): AbstractItem[] { return this._potions; }

  public get miscellaneous(): Miscellaneous[] { return this._miscellaneous; }

  public collectGold(amount: number): void { this._gold += amount; }

  public collectItem(item: AbstractItem): void {
    if (item instanceof Weapon) this._weapons.push(item);
    if (item instanceof Armor) this._armors.push(item);
    if (item instanceof Miscellaneous) this._miscellaneous.push(item);
    if (item instanceof Potion) this._potions.push(item);
  }

  public dropItem(fullName: string, type: 'weapon' | 'armor' | 'potion' | 'miscellaneous' = 'miscellaneous'): string {
    let inventorySection = this._miscellaneous;
    if (type === 'weapon') inventorySection = this._weapons;
    if (type === 'armor') inventorySection = this._armors;
    if (type === 'potion') inventorySection = this._potions;
    const index = inventorySection.findIndex((item: AbstractItem) => item.name === fullName);
    if (index >= 0) {
      inventorySection.splice(index, 1);
      return `Вы выкинули ${fullName}. Идти становится легче`;
    }
    console.log('AbstractInventory::dropItem', 'Item not found');
    return 'Странно, но вы не можете снова найти этот предмет...Возможно, его и не было?';
  }

  public getArmorByName(fullName: string): Armor | undefined {
    return this._armors.find((item) => item.name === fullName);
  }

  public getWeaponByName(fullName: string): Weapon | undefined {
    return this._weapons.find((item) => item.name === fullName);
  }
}
