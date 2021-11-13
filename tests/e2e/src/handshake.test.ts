import {
  describe,
  beforeAll, beforeEach, afterEach,
  it,
  expect,
} from '@jest/globals';

// eslint-disable-next-line import/no-extraneous-dependencies
import { HandshakeTranslations } from '@translations/@types';

import {
  createConnection,
  waitConnection,
  waitMessage,
  createMessageFromServer,
  createMessageToServer,
  closeConnection,

  Transport,
  sendAnswer,
  MessageFromServer,
  createMessageQueue,
} from './utils/index';

describe('Handshake test', () => {
  let transport: Transport;
  let translations: HandshakeTranslations;
  let translationsActionPlaceholder: string;

  const handshakeMessages: MessageFromServer[] = [];

  beforeAll(async () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line import/no-extraneous-dependencies
    const { MESSAGES } = await import('@translations/ru');
    translations = MESSAGES.handshake;
    translationsActionPlaceholder = MESSAGES.actionPlaceholder;

    handshakeMessages.push(
      createMessageFromServer(
        translations.text,
      ),
      createMessageFromServer(
        translationsActionPlaceholder,
        [
          [
            { id: 1, text: translations.START_NEW_GAME, type: 'START_NEW_GAME' },
          ],
          [
            { id: 2, text: translations.DONATE_LINK, type: 'DONATE_LINK' },
            { id: 3, text: translations.MAIN_CONTACT, type: 'MAIN_CONTACT' },
          ],
        ],
      ),

    );
  });

  beforeEach(() => {
    transport = createConnection();
  });

  afterEach(() => {
    closeConnection(transport);
  });

  it('should connect fine', async () => {
    await waitConnection(transport);
  }, 1000);

  it('should send handshake message', async () => {
    const queue = createMessageQueue(transport);
    expect(await queue.take()).toEqual(handshakeMessages[0]);
    expect(await queue.take()).toEqual(handshakeMessages[1]);
  }, 1000);

  it('should send donate link', async () => {
    const queue = createMessageQueue(transport);
    await queue.take();
    await queue.take();
    queue.send(createMessageToServer(2));
    expect(await queue.take()).toEqual({ text: expect.stringMatching(/^https:\/\/*/) });
    expect(await queue.take()).toEqual(handshakeMessages[1]);
  });

  it('should send main contacts', async () => {
    const queue = createMessageQueue(transport);
    await queue.take();
    await queue.take();
    queue.send(createMessageToServer(3));
    expect(await queue.take()).toEqual({ text: expect.stringMatching(/^https:\/\/t.me\/*/) });
    expect(await queue.take()).toEqual(handshakeMessages[1]);
  });
});
