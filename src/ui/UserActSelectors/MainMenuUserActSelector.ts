import { MESSAGES } from '@translations/ru';

import { BaseUserActSelector, createUserAction, UserAction } from './BaseUserActSelector';

const { handshake, commonActions } = MESSAGES;

export class MainMenuUserActSelector extends BaseUserActSelector {
  protected _staticLayout: UserAction[][] = [
    [
      createUserAction(1, commonActions.EXIT, 'FINISH_SESSION'),
      createUserAction(2, commonActions.BACK, 'BACK'),
    ],
    [
      createUserAction(3, handshake.DONATE_LINK, 'DONATE_LINK'),
      createUserAction(4, handshake.MAIN_CONTACT, 'MAIN_CONTACT'),
    ],
  ];

  protected _idSequence: number = 5;
}
