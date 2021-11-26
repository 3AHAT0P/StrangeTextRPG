import { Server, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';

import { getConfig } from 'ConfigProvider';
import { MESSAGES } from '@translations/ru';
import logger from '@utils/Logger';
import { throwTextFnCarried, safeGet } from '@utils';

import {
  AbstractSessionUI,
  StartTheGameCallback, FinishTheGameCallback,
  AdditionalSessionInfo,
} from '../@types';
import { SessionUIProxy } from '../SessionUIProxy';
import { UserActSelectorManager, UserActSelectorType } from '../UserActSelectors/UserActSelectorManager';
import { BaseUserActSelector } from '../UserActSelectors/BaseUserActSelector';

import { UserActSelectorSocketAdapter } from './UserActSelectorSocketAdapter';

const config = getConfig();

export class SocketUI implements AbstractSessionUI {
  private _transport: Server = new Server({ serveClient: false });

  private _clientMap = new Map<string, { socket: Socket, manager: UserActSelectorManager }>();

  private async _prepareNewSession(
    runOnStart: StartTheGameCallback,
    runOnFinish: FinishTheGameCallback,
    socket: Socket,
  ): Promise<void> {
    const sessionId = socket.id;

    const adapter = new UserActSelectorSocketAdapter({
      sessionId,
      socket,
      transport: this._transport,
    });

    const manager = new UserActSelectorManager(adapter);
    this._clientMap.set(sessionId, { socket, manager });

    socket.on('disconnect', (reason: string) => {
      this._clientMap.delete(sessionId);
      console.log(sessionId, this._clientMap);
      setTimeout(runOnFinish, 16, sessionId, this);
      logger.warn(`Client are disconnected with reason: ${reason}`);
    });
    await this._handshake(sessionId, runOnStart);
  }

  private async _handshake(sessionId: string, runOnStart: StartTheGameCallback): Promise<void> {
    const { socket } = safeGet(
      this._clientMap.get(sessionId),
      throwTextFnCarried('Manager is null. Incorrect sessionId'),
    );
    const actSelector = this.getUserActSelector(sessionId, 'HANDSHAKE');

    const { handshake } = MESSAGES;

    await this.sendToUser(sessionId, handshake.text);

    while (true) {
      // eslint-disable-next-line no-await-in-loop
      const [actionType] = await actSelector.show();

      if (actionType === 'START_NEW_GAME') {
        const additionalSessionInfo: AdditionalSessionInfo = {
          playerName: socket.data.username,
          playerId: socket.data.playerId,
        };
        const sessionUI = new SessionUIProxy(this, sessionId);
        setTimeout(runOnStart, 16, sessionId, sessionUI, additionalSessionInfo);
        break;
      } else if (actionType === 'DONATE_LINK') {
        // eslint-disable-next-line no-await-in-loop
        await this.sendToUser(sessionId, config.DONATE_LINK);
      } else if (actionType === 'MAIN_CONTACT') {
        // eslint-disable-next-line no-await-in-loop
        await this.sendToUser(sessionId, config.MAIN_CONTACT);
      }
    }
  }

  public init(runOnStart: StartTheGameCallback, runOnFinish: FinishTheGameCallback): this {
    this._transport.on('connection', this._prepareNewSession.bind(this, runOnStart, runOnFinish));

    this._transport.listen(8888);
    this._transport.engine.generateId = uuidv4;

    return this;
  }

  public createUserActSelector(sessionId: string, type: UserActSelectorType): BaseUserActSelector {
    // console.log('@@@@@@@', sessionId, this._clientMap);
    const { manager } = safeGet(
      this._clientMap.get(sessionId),
      throwTextFnCarried('Manager is null. Incorrect sessionId'),
    );
    const actSelector = manager.create(type);
    return actSelector;
  }

  public getUserActSelector(sessionId: string, type: UserActSelectorType): BaseUserActSelector {
    const { manager } = safeGet(
      this._clientMap.get(sessionId),
      throwTextFnCarried('Manager is null. Incorrect sessionId'),
    );
    const actSelector = manager.takeOrCreate(type);
    manager.add(type, actSelector);
    return actSelector;
  }

  public closeSession(sessionId: string): Promise<void> {
    const client = this._clientMap.get(sessionId);
    if (client == null) return Promise.resolve();
    client.socket.disconnect(true);
    this._clientMap.delete(sessionId);
    return Promise.resolve();
  }

  public async onExit(sessionIds: string[]): Promise<void> {
    await Promise.allSettled(sessionIds.map((sessionId) => this.sendToUser(
      sessionId,
      'Извини, но я нуждаюсь в перезагрузке. Прошу меня извинить. Пожалуйста, начни игру заново.',
    )));
    return new Promise((resolve, reject) => {
      this._clientMap.clear();
      this._transport.close((error) => {
        if (error != null) reject(error);
        resolve();
      });
    });
  }

  public async sendToUser(sessionId: string, message: string): Promise<void> {
    this._transport.to(sessionId).emit('MESSAGE', { text: message });
  }
}
