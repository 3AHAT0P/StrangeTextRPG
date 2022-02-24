import { Server, Socket } from 'socket.io';

import { MESSAGES } from '@translations/ru';
import { UserAction } from '../UserActSelectors/BaseUserActSelector';
import { UserActionsAdapterOptions, UserActSelectorAbstractAdapter } from '../UserActSelectorAbstractAdapter';

export interface MessageToClient {
  text: string;
  userActLayout?: Omit<UserAction, 'originalAction' | 'additionalData'>[][];
  needAnswer?: boolean;
  hideActLayout?: boolean;
}

export interface AnswerFromClient {
  answer: UserAction['id'];
}

const removeOriginalAction = (
  layout: UserAction[][],
): Omit<UserAction, 'originalAction' | 'additionalData'>[][] => (
  layout.map(
    (arr) => (
      arr.map(
        ({
          id, text, type,
        }) => ({
          id, text, type,
        }),
      )
    ),
  )
);

export class UserActSelectorSocketAdapter extends UserActSelectorAbstractAdapter {
  declare protected _transport: Server;

  private _socket: Socket;

  private _defaultMessageText: string = MESSAGES.actionPlaceholder;

  constructor(options: UserActionsAdapterOptions & { socket: Socket }) {
    super(options);
    this._socket = options.socket;
  }

  async show(layout: UserAction[][]): Promise<number> {
    const eventData: MessageToClient = {
      text: this._defaultMessageText,
      userActLayout: removeOriginalAction(layout),
      needAnswer: true,
    };
    return new Promise((resolve, reject) => {
      this._defer = { resolve, reject };
      this._socket.once('ANSWER', (data: AnswerFromClient) => {
        this._defer = null;
        resolve(data.answer);
      });
      this._transport.to(this._sessionId).emit('MESSAGE', eventData);
    });
  }

  async hide(): Promise<boolean> {
    this._transport.to(this._sessionId).emit('MESSAGE', {
      text: this._defaultMessageText,
      hideActLayout: true,
    });
    if (this._defer !== null) {
      this._defer.reject(new Error('UserActions hidden directly'));
      this._defer = null;
    }
    return true;
  }
}
