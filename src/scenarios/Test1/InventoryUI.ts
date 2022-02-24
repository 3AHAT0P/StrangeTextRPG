import { createSelector, repeat } from '@3ahat0p/strange-utils/node';

import { Player } from '@actors';
import { AbstractInventory } from '@actors/AbstractInventory';
import { AbstractItem } from '@actors/AbstractItem';
import { Armor } from '@actors/armor';
import { Inventory } from '@actors/Inventory';
import { Miscellaneous } from '@actors/miscellaneous';
import { Potion } from '@actors/potions';
import { Weapon } from '@actors/weapon';
import { ActionSubtype } from '@db/entities/Action';
import { AbstractUI } from '@ui/@types';
import { Template } from '@utils/Template';
import { MESSAGES } from '@translations/ru';

const { inventoryActions, commonActions } = MESSAGES;

// const equipmentList = new Template<{ wearingEquipment: HumanoidEquipmentSlots; }>(
//   '⚔️Результаты раунда:\n'
//   + ' - У {{actorType player declension="genitive"}} осталось {{showActorHealthPoints player}} ОЗ;\n'
//   + '{{#each aliveEnemies}}'
//   + ' - У {{actorType this declension="genitive" withPostfix=true}} осталось {{showActorHealthPoints this}} ОЗ;\n'
//   + '{{/each}}',
// );

// const printEquipment = (player: Player): string => {
//   const equipment = [];
//   if (player.wearingEquipment.body != null) equipment.push(`  ${capitalise(player.wearingEquipment.body.name)}`);
//   if (player.wearingEquipment.legs != null) equipment.push(`  ${capitalise(player.wearingEquipment.legs.name)}`);

//   return equipment.join('\n');
// };

export interface InvetoryUiOptions {
  ui: AbstractUI;
  player: Player;
}

export class InvetoryUI {
  private _ui!: AbstractUI;

  private _player!: Player;

  constructor({ ui, player }: InvetoryUiOptions) {
    this._ui = ui;
    this._player = player;
  }

  private async _itemActMenu(
    item: AbstractItem,
    itemType: 'weapons' | 'armors' | 'potions' | 'miscellaneous',
  ): Promise<void> {
    if (itemType === 'weapons' || itemType === 'armors') {
      await this._ui.sendToUser(
        this._player.compareWithEquipped(item.name, itemType.slice(0, -1) as 'weapon' | 'armor'),
      );
    }

    const actSelector = this._ui.createUserActSelector('BASE');
    if (!(item instanceof Miscellaneous)) {
      actSelector.addAction(
        'Использовать',
        'INVENTORY_ITEM_USE',
        1,
        null,
        () => {
          if (item instanceof Weapon) this._player.equipWeapon(item);
          else if (item instanceof Armor) this._player.equipArmor(item);
          else if (item instanceof Potion) this._player.inventory.useItem(item, this._player);
        },
      );
    }
    actSelector.addAction(
      inventoryActions.DROP,
      'INVENTORY_ITEM_DROP',
      1,
      null,
      () => this._ui.sendToUser(this._player.inventory.dropItem(item)),
    );
    actSelector.addAction(
      commonActions.BACK,
      'BACK',
      2,
      null,
    );

    const [actType, , runner] = await actSelector.show();
    if (actType === 'BACK') return;

    if (runner != null) runner?.();
    else await this._ui.sendToUser('Снова это чувство, как когда забыл зачем пришел...');
  }

  private async _openInventorySection(
    inventory: AbstractInventory,
    itemType: 'weapons' | 'armors' | 'potions' | 'miscellaneous',
  ): Promise<void> {
    const listSelector = this._ui.createUserActSelector('BASE');

    await repeat.infinity.async.run(async ({ stop }) => {
      const items: AbstractItem[] = inventory[itemType];

      if (items.length === 0) {
        await this._ui.sendToUser('Увы, в этом кармане пусто');
        return stop();
      }

      listSelector.clear();

      let index: number = 0;
      for (const item of items) {
        listSelector.addAction(item.name, `INVENTORY_${index}`, Math.trunc(index / 3), null, item);
        index += 1;
      }
      listSelector.addAction(commonActions.BACK, 'BACK', Math.trunc(index / 3) + 1);

      const [actType, , item] = await listSelector.show<AbstractItem>();

      if (actType === 'BACK') return stop();

      await this._itemActMenu(item, itemType);
    });
  }

  public async showInventory(): Promise<void> {
    const { inventory } = this._player;

    const actSelector = this._ui.createUserActSelector('INVENTORY_MENU');

    const selector = createSelector<ActionSubtype, Promise<void>>()
      .when
      .isEqual('INVENTORY_CHOOSE_WEAPON')
      .do(() => this._openInventorySection(inventory, 'weapons'))

      .when
      .isEqual('INVENTORY_CHOOSE_ARMOR')
      .do(() => this._openInventorySection(inventory, 'armors'))

      .when
      .isEqual('INVENTORY_CHOOSE_POITIONS')
      .do(() => this._openInventorySection(inventory, 'potions'))

      .when
      .isEqual('INVENTORY_CHOOSE_MISC')
      .do(() => this._openInventorySection(inventory, 'miscellaneous'))

      .fallback(() => { throw new Error('Action is not correct'); });

    await repeat.infinity.async.run(async ({ stop }) => {
      const [actType] = await actSelector.show();

      if (actType === 'BACK') return stop();

      await selector(actType);
    });
  }
}
