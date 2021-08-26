import { Armor } from '@armor';
import { Weapon } from '@weapon';
import logger from '@utils/Logger';
import { Miscellaneous } from '@actors/miscellaneous';
import { HealthPotion, Potion } from '@actors/potions';
import type { AbstractActor } from '@actors/AbstractActor';
import type { AbstractItem } from '@actors/AbstractItem';

export abstract class AbstractInventory {
  protected _gold: number = 0;

  protected _armors: Armor[] = [];

  protected _weapons: Weapon[] = [];

  protected _potions: Potion[] = [];

  protected _miscellaneous: Miscellaneous[] = [];

  protected _wearingEquipment: unknown;

  protected checkExists(item: AbstractItem) {
    let searchSection;
    if (item instanceof Weapon) searchSection = this._weapons;
    if (item instanceof Armor) searchSection = this._armors;
    if (item instanceof Miscellaneous) searchSection = this._miscellaneous;
    if (item instanceof Potion) searchSection = this._potions;
    if (searchSection == null) {
      logger.info('AbstractInventory::checkExists', 'Unknown item type');
      return false;
    }
    // TODO change to check id when items will have an id
    return searchSection.some((inventoryItem) => inventoryItem.name === item.name);
  }

  public get armors(): Armor[] { return this._armors; }

  public get weapons(): Weapon[] { return this._weapons; }

  public get potions(): AbstractItem[] { return this._potions; }

  public get miscellaneous(): Miscellaneous[] { return this._miscellaneous; }

  public get healthPotions(): number { return this._potions.filter((item) => item.type === 'HEALTH').length; }

  public collectGold(amount: number): void { this._gold += amount; }

  public get gold(): number { return this._gold; }

  public exchangeGold(amount: number): void { this._gold -= amount; }

  public collectItem(item: AbstractItem): void {
    if (item instanceof Weapon) this._weapons.push(item);
    if (item instanceof Armor) this._armors.push(item);
    if (item instanceof Miscellaneous) this._miscellaneous.push(item);
    if (item instanceof Potion) this._potions.push(item);
  }

  public dropItem(item: AbstractItem): string {
    let inventorySection;
    if (item instanceof Weapon) inventorySection = this._weapons;
    if (item instanceof Armor) inventorySection = this._armors;
    if (item instanceof Potion) inventorySection = this._potions;
    if (item instanceof Miscellaneous) inventorySection = this._miscellaneous;
    if (inventorySection == null) {
      logger.info('AbstractInventory::dropItem', 'unknown instance of item');
      return 'Вы никак не можете найти нужный карман';
    }
    const index = inventorySection.findIndex((inventoryItem: AbstractItem) => inventoryItem.name === item.name);
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
