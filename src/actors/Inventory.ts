import { AbstractInventory } from '@actors/AbstractInventory';
import { Weapon } from '@weapon';
import { Armor } from '@armor';
import { AbstractItem } from '@actors/AbstractItem';

const armorSubtypes = <const>{
  LIGHT: 'Легкая',
  HEAVY: 'Тяжелая',
};

const armorTypes = <const>{
  HELMET: 'Шлем',
  HOOD: 'Капюшон',
  HAT: 'Шляпа',
  NECKLE: 'Ожерелье',
  GLOVES: 'Перчатки',
  GAUNTLETS: 'Латные перчатки',
  RING: 'Кольцо',
  TROUSERS: 'Брюки',
  BOOTS: 'Ботинки',
  SABATONS: 'Латные ботинки',
  SHIELD: 'Щит',
  CHEST: 'Нагрудник',
  CUIRASS: 'Кираса',
  JACKET: 'Пиджак',
  COAT: 'Куртка',
  LEATHER: 'Шкура',
  SKELETON: 'Кости', // ?
};

const weaponTypes = <const>{
  FIST: 'Кулак',
  KNIFE: 'Нож',
  STONE: 'Камень',
  SHIELD: 'Щит',
  SWORD: 'Меч',
  AXE: 'Топор',
  TEETH: 'Клыки',
  PAWS: 'Лапы',
  NONE: '-',
};

const weaponSubtypes = <const>{
  ONE_HAND: 'Одноручное',
  TWO_HAND: 'Двуручное',
  THROWABLE: 'Метательное',
  ESPECIAL: 'Особое',
};

export class Inventory<T> extends AbstractInventory {
  protected _wearingEquipment: T;

  constructor({ defaultEquipment, gold }: { defaultEquipment: T, gold?: number }) {
    super();
    this._wearingEquipment = defaultEquipment;
    this._gold = gold ?? 0;
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
