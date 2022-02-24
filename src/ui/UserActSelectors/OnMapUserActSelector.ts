import { MESSAGES } from '@translations/ru';

import { BaseUserActSelector, createUserAction, UserAction } from './BaseUserActSelector';

const { onMapActions } = MESSAGES;

export class OnMapUserActSelector extends BaseUserActSelector {
  protected _staticLayout: UserAction[][] = [
    [
      createUserAction(1, onMapActions.SHOW_HELP, 'SHOW_HELP'),
      createUserAction(2, onMapActions.MOVE_TO_NORTH, 'MOVE_TO_NORTH'),
      createUserAction(3, onMapActions.SHOW_MAP, 'SHOW_MAP'),
    ],
    [
      createUserAction(4, onMapActions.MOVE_TO_WEST, 'MOVE_TO_WEST'),
      createUserAction(5, onMapActions.INVENTORY_OPEN, 'INVENTORY_OPEN'),
      createUserAction(6, onMapActions.MOVE_TO_EAST, 'MOVE_TO_EAST'),
    ],
    [
      createUserAction(7, onMapActions.TAKE_A_REST, 'TAKE_A_REST'),
      createUserAction(8, onMapActions.MOVE_TO_SOUTH, 'MOVE_TO_SOUTH'),
      createUserAction(9, onMapActions.OPEN_MAIN_MENU, 'OPEN_MAIN_MENU'),
    ],
  ];

  protected _idSequence: number = 10;
}
