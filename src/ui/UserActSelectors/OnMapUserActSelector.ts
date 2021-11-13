import { MESSAGES } from '@translations/ru';

import { BaseUserActSelector, UserAction } from './BaseUserActSelector';

const { onMapActions } = MESSAGES;

export class OnMapUserActSelector extends BaseUserActSelector {
  protected _layout: UserAction[][] = [
    [
      { id: 1, text: onMapActions.SHOW_HELP, type: 'SHOW_HELP' },
      { id: 2, text: onMapActions.MOVE_TO_NORTH, type: 'MOVE_TO_NORTH' },
      { id: 3, text: onMapActions.SHOW_MAP, type: 'SHOW_MAP' },
    ],
    [
      { id: 4, text: onMapActions.MOVE_TO_WEST, type: 'MOVE_TO_WEST' },
      { id: 5, text: onMapActions.INVENTORY_OPEN, type: 'INVENTORY_OPEN' },
      { id: 6, text: onMapActions.MOVE_TO_EAST, type: 'MOVE_TO_EAST' },
    ],
    [
      { id: 7, text: onMapActions.TAKE_A_REST, type: 'TAKE_A_REST' },
      { id: 8, text: onMapActions.MOVE_TO_SOUTH, type: 'MOVE_TO_SOUTH' },
      { id: 9, text: onMapActions.OPEN_MAIN_MENU, type: 'OPEN_MAIN_MENU' },
    ],
  ];

  protected _idSequence: number = 10;
}
