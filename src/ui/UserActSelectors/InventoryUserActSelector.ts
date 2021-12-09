import { MESSAGES } from '@translations/ru';

import { BaseUserActSelector, createUserAction, UserAction } from './BaseUserActSelector';

const { inventoryActions } = MESSAGES;

export class InventoryUserActSelector extends BaseUserActSelector {
  protected _layout: UserAction[][] = [
    [
      createUserAction(1, inventoryActions.OPEN_WEAPON, 'INVENTORY_CHOOSE_WEAPON'),
      createUserAction(2, inventoryActions.OPEN_ARMOR, 'INVENTORY_CHOOSE_ARMOR'),
    ],
    [
      createUserAction(3, inventoryActions.OPEN_POTIONS, 'INVENTORY_CHOOSE_POITIONS'),
      createUserAction(4, inventoryActions.OPEN_MISCELLANEOUS, 'INVENTORY_CHOOSE_MISC'),
    ],
    [
      createUserAction(5, inventoryActions.CLOSE_INVENTORY, 'BACK'),
    ],
  ];

  protected _idSequence: number = 6;
}
