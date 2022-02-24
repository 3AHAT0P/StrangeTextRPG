import { MESSAGES } from '@translations/ru';

import { BaseUserActSelector, createUserAction, UserAction } from './BaseUserActSelector';

const { handshake } = MESSAGES;

export class HandshakeUserActSelector extends BaseUserActSelector {
  protected _staticLayout: UserAction[][] = [
    [
      createUserAction(1, handshake.START_NEW_GAME, 'START_NEW_GAME'),
    ],
    [
      createUserAction(2, handshake.DONATE_LINK, 'DONATE_LINK'),
      createUserAction(3, handshake.MAIN_CONTACT, 'MAIN_CONTACT'),
    ],
  ];

  protected _idSequence: number = 4;
}
