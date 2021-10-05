import logger from '@utils/Logger';
import {
  HeadArmor,
  NeckArmor,
  BodyArmor,
  HandsArmor,
  FingersArmor,
  LegsArmor,
  FeetArmor,
  Armor,
  InHandArmor,
} from '@armor';
import { FistWeapon, Weapon } from '@weapon';
import { Inventory } from '@actors/Inventory';
import { AbstractItem } from '@actors/AbstractItem';

import {
  AbstractActor,
  AbstractActorOptions,
} from './AbstractActor';

export interface HumanoidEquipmentSlots {
  head?: HeadArmor; // Helmet, Hood, Hat
  neck?: NeckArmor; // Neckle
  body?: BodyArmor; // Chests, cuirass, jacket, coat
  hands?: HandsArmor; // Gloves, Gauntlets
  fingers?: FingersArmor; // Ring
  leftHand?: Weapon | InHandArmor; // Shield
  rightHand: Weapon; // Knife, sword, ...
  legs?: LegsArmor; // trousers
  feet?: FeetArmor; // Boots, sabatons
}

export abstract class AbstractHumanoid extends AbstractActor {
  public inventory: Inventory<keyof HumanoidEquipmentSlots, HumanoidEquipmentSlots>;

  public get armor(): number {
    const { wearingEquipment } = this.inventory;
    return (wearingEquipment.head?.armor ?? 0)
      + (wearingEquipment.body?.armor ?? 0)
      + (wearingEquipment.hands?.armor ?? 0)
      + (wearingEquipment.legs?.armor ?? 0)
      + (wearingEquipment.feet?.armor ?? 0);
  }

  public get attackDamage(): number { return this.inventory.wearingEquipment.rightHand?.attackDamage ?? 0; }

  public get criticalChance(): number { return this.inventory.wearingEquipment.rightHand?.criticalChance ?? 0; }

  public get criticalDamageModifier(): number {
    return this.inventory.wearingEquipment.rightHand?.criticalDamageModifier ?? 0;
  }

  public get accuracy(): number { return this.inventory.wearingEquipment.rightHand?.accuracy ?? 0; }

  public get wearingEquipment(): HumanoidEquipmentSlots { return this.inventory.wearingEquipment; }

  public get gold(): number { return this.inventory.gold; }

  constructor(options: AbstractActorOptions = {}) {
    super(options);

    this.maxHealthPoints = 10;
    this.healthPoints = 8;
    this.inventory = new Inventory({
      defaultEquipment: {
        rightHand: new FistWeapon(),
      },
    });
  }

  public compareWithEquipped(fullName: string, itemType: 'armor' | 'weapon'): string {
    if (itemType === 'armor') {
      const fromInventory = this.inventory.armors.find((item: Armor) => item.name === fullName);
      if (fromInventory == null) {
        logger.info('Player::compareWithEquipped', 'fromInventory is null');
        return 'Упс...что-то сломалось';
      }
      let fromEquipment;
      if (fromInventory instanceof BodyArmor) fromEquipment = this.inventory.wearingEquipment.body;
      else if (fromInventory instanceof HeadArmor) fromEquipment = this.inventory.wearingEquipment.head;
      else if (fromInventory instanceof NeckArmor) fromEquipment = this.inventory.wearingEquipment.neck;
      else if (fromInventory instanceof HandsArmor) fromEquipment = this.inventory.wearingEquipment.hands;
      else if (fromInventory instanceof FingersArmor) fromEquipment = this.inventory.wearingEquipment.fingers;
      else if (fromInventory instanceof LegsArmor) fromEquipment = this.inventory.wearingEquipment.legs;
      else if (fromInventory instanceof FeetArmor) fromEquipment = this.inventory.wearingEquipment.feet;
      else if (fromInventory instanceof InHandArmor) fromEquipment = this.inventory.wearingEquipment.leftHand;
      const equippedStats = fromEquipment == null ? 'На вас ничего не надето.' : `Надето\n${this.inventory.getStats(fromEquipment)}`;
      return `${equippedStats}\n${this.inventory.getStats(fromInventory)}`;
    }
    if (itemType === 'weapon') {
      const fromInventory = this.inventory.weapons.find((item: Weapon) => item.name === fullName);
      const fromEquipment = this.wearingEquipment.rightHand;
      if (fromInventory == null) {
        logger.info('Player::compareWithEquipped', 'fromInventory is null');
        return 'Упс...что-то сломалось';
      }
      const equippedStats = fromEquipment == null ? 'На вас ничего не надето.' : `Надето\n${this.inventory.getStats(fromEquipment)}`;
      return `${equippedStats}\n${this.inventory.getStats(fromInventory)}`;
    }
    return '';
  }

  public exchangeGoldToItem(goldCount: number, items: AbstractItem[]): boolean {
    if (this.inventory.gold < goldCount) return false;

    this.inventory.exchangeGold(goldCount);
    items.forEach((item) => this.inventory.collectItem(item));
    return true;
  }

  public exchangeItemToGold(goldCount: number, item: AbstractItem): boolean {
    // add logic for find needed item
    // if (not found in inventory) return false;

    this.inventory.collectGold(goldCount);
    this.inventory.dropItem(item);
    return true;
  }

  public equipWeapon(weapon: Weapon | InHandArmor, hand: 'LEFT' | 'RIGHT' = 'RIGHT'): void {
    if (weapon instanceof InHandArmor || hand === 'LEFT') {
      this.inventory.equipToSlot('leftHand', weapon);
    } else {
      this.inventory.equipToSlot('rightHand', weapon);
    }
  }

  public equipArmor(
    armor: HeadArmor | NeckArmor | BodyArmor | HandsArmor | FingersArmor | LegsArmor | FeetArmor | InHandArmor,
  ): void {
    let slot: Exclude<keyof HumanoidEquipmentSlots, 'rightHand'>;
    if (armor instanceof BodyArmor) slot = 'body';
    else if (armor instanceof HeadArmor) slot = 'head';
    else if (armor instanceof NeckArmor) slot = 'neck';
    else if (armor instanceof HandsArmor) slot = 'hands';
    else if (armor instanceof FingersArmor) slot = 'fingers';
    else if (armor instanceof LegsArmor) slot = 'legs';
    else if (armor instanceof FeetArmor) slot = 'feet';
    else if (armor instanceof InHandArmor) slot = 'leftHand';
    else {
      logger.error('Player::equipArmor', 'Slot is null');
      return;
    }
    this.inventory.equipToSlot(slot, armor);
  }
}
