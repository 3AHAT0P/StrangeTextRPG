import { Armor } from '@armor';
import { Weapon } from '@weapon';
import logger from '@utils/Logger';
import { Miscellaneous } from '@actors/miscellaneous';
import { Potion } from '@actors/potions';
import type { AbstractActor } from '@actors/AbstractActor';
import type { AbstractItem } from '@actors/AbstractItem';

// eslint-disable-next-line no-prototype-builtins
const isPrototypeOf = (classA: any, classB: any): boolean => classA.isPrototypeOf(classB);

export abstract class AbstractInventory {
  protected _gold: number = 0;

  protected _armors: Armor[] = [];

  protected _weapons: Weapon[] = [];

  protected _potions: Potion[] = [];

  protected _miscellaneous: Miscellaneous[] = [];

  protected _wearingEquipment: unknown;

  protected _getListByItemType(item: AbstractItem): Array<Armor | Weapon | Potion | Miscellaneous> {
    if (item instanceof Weapon) return this._weapons;
    if (item instanceof Armor) return this._armors;
    if (item instanceof Miscellaneous) return this._miscellaneous;
    if (item instanceof Potion) return this._potions;

    logger.info('AbstractInventory::_getListByItemType', 'Unknown item type');
    throw new Error('Unknown item type');
  }

  protected checkExists(item: AbstractItem) {
    const searchSection = this._getListByItemType(item);

    return searchSection.some((inventoryItem) => inventoryItem.id === item.id);
  }

  public get armors(): Armor[] { return this._armors; }

  public get weapons(): Weapon[] { return this._weapons; }

  public get potions(): Potion[] { return this._potions; }

  public get miscellaneous(): Miscellaneous[] { return this._miscellaneous; }

  public get healthPotions(): number { return this._potions.filter((item) => item.type === 'HEALTH').length; }

  public collectGold(amount: number): void { this._gold += amount; }

  public get gold(): number { return this._gold; }

  public exchangeGold(amount: number): void { this._gold -= amount; }

  public getItemsByClass(itemClass: typeof AbstractItem): AbstractItem[] {
    let section: AbstractItem[] = [];
    if (isPrototypeOf(Weapon, itemClass)) section = this.weapons;
    if (isPrototypeOf(Armor, itemClass)) section = this.armors;
    if (isPrototypeOf(Potion, itemClass)) section = this.potions;
    if (isPrototypeOf(Miscellaneous, itemClass)) section = this.miscellaneous;

    return section.filter((item) => item instanceof itemClass);
  }

  public collectItem(item: AbstractItem): void {
    this._getListByItemType(item).push(item);
  }

  public dropItem(item: AbstractItem): string {
    const inventorySection = this._getListByItemType(item);

    const index = inventorySection.findIndex((inventoryItem: AbstractItem) => inventoryItem.id === item.id);
    if (index >= 0) {
      inventorySection.splice(index, 1);
      return `Вы выкинули ${item.name}. Идти становится легче`;
    }
    logger.info('AbstractInventory::dropItem', 'Item not found');
    return 'Странно, но вы не можете снова найти этот предмет...Возможно, его и не было?';
  }

  public getArmorByName(fullName: string): Armor | undefined {
    return this._armors.find((item) => item.name === fullName);
  }

  public getWeaponByName(fullName: string): Weapon | undefined {
    return this._weapons.find((item) => item.name === fullName);
  }

  public getPotionByName(fullName: string): Potion | undefined {
    return this._potions.find((item) => item.name === fullName);
  }

  public getMiscellaneousByName(fullName: string): Miscellaneous | undefined {
    return this._miscellaneous.find((item) => item.name === fullName);
  }

  public useItem(item: AbstractItem, target: AbstractActor): string {
    const isExist = this.checkExists(item);
    if (!isExist) {
      logger.info('AbstractInventory::useItem', 'No item to be used');
      return 'Кажется, вы забыли, как это использовать';
    }
    const message = item.use(target);
    this.dropItem(item);
    return message;
  }
}
