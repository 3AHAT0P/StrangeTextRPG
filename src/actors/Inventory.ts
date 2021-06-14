import { AbstractInventory } from '@actors/AbstractInventory';
import { Weapon } from '@weapon';
import { Armor, BodyArmor } from '@armor';
import { AbstractItem } from '@actors/AbstractItem';

const armorSubtypes = <const>{
  LIGHT: 'Легкая',
  HEAVY: 'Тяжелая',
};

const armorTypes = <const>{
  HELMET: 'HELMET',
  HOOD: 'HOOD',
  HAT: 'HAT',
  NECKLE: 'NECKLE',
  GLOVES: 'GLOVES',
  GAUNTLETS: 'GAUNTLETS',
  RING: 'RING',
  TROUSERS: 'TROUSERS',
  BOOTS: 'BOOTS',
  SABATONS: 'SABATONS',
  SHIELD: 'SHIELD',
  CHEST: 'CHEST',
  CUIRASS: 'CUIRASS',
  JACKET: 'JACKET',
  COAT: 'COAT',
  LEATHER: 'LEATHER',
  SKELETON: 'SKELETON',
};

const weaponTypes = <const>{
  FIST: 'FIST',
  KNIFE: 'KNIFE',
  STONE: 'STONE',
  SHIELD: 'SHIELD',
  SWORD: 'SWORD',
  AXE: 'AXE',
  TEETH: 'TEETH',
  PAWS: 'PAWS',
  NONE: 'NONE',
};

const weaponSubtypes = <const>{
  ONE_HAND: 'ONE_HAND',
  TWO_HAND: 'TWO_HAND',
  THROWABLE: 'THROWABLE',
  ESPECIAL: 'ESPECIAL',
};

export class Inventory<T> extends AbstractInventory {
  protected _wearingEquipment: T;

  constructor({ defaultEquipment, gold }: { defaultEquipment: T, gold?: number }) {
    super();
    this._wearingEquipment = defaultEquipment;
    if (gold != null) this._gold = gold;
  }

  public get wearingEquipment(): T { return this._wearingEquipment; }

  public getStats(item: AbstractItem): string {
    if (item instanceof Armor) {
      return `${item.name} характеристики:\n`
      + `  Тип: ${armorTypes[item.type]}\n`
      + `  Подтип: ${armorSubtypes[item.subtype]}\n`
      + `  Броня: ${item.armor}\n`;
    }
    if (item instanceof Weapon) {
      return `${item.name} характеристики:\n`
        + `  Тип: ${weaponTypes[item.type]}\n`
        + `  Подтип: ${weaponSubtypes[item.subtype]}\n`
        + `  Урон: ${item.attackDamage}\n`
        + `  Шанс попасть ударом: ${item.accuracy}\n`
        + `  Шанс попасть в уязвимое место: ${item.criticalChance}\n`
        + `  Модификатор критического урона: ${item.criticalDamageModifier}\n`;
    }
    console.log('Inventory::getStats', 'item is not one of the types: Armor, Weapon');
    return '';
  }
}
