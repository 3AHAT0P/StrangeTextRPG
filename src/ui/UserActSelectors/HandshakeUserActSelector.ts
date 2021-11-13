import { MESSAGES } from '@translations/ru';

import { BaseUserActSelector, UserAction } from './BaseUserActSelector';

const { handshake } = MESSAGES;

export class HandshakeUserActSelector extends BaseUserActSelector {
  protected _layout: UserAction[][] = [
    [
      { id: 1, text: handshake.START_NEW_GAME, type: 'START_NEW_GAME' },
    ],
    [
      { id: 2, text: handshake.DONATE_LINK, type: 'DONATE_LINK' },
      { id: 3, text: handshake.MAIN_CONTACT, type: 'MAIN_CONTACT' },
    ],
  ];

  protected _idSequence: number = 4;
}
