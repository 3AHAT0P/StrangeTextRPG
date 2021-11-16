import {
  describe,
  beforeAll, beforeEach, afterEach,
  it,
  expect,
} from '@jest/globals';

// eslint-disable-next-line import/no-extraneous-dependencies
import { CommonActionsTranslations, IntroTranslations } from '@translations/@types';

import {
  createConnection,
  createMessageFromServer,
  createMessageToServer,
  closeConnection,

  Transport,
  MessageFromServer,
  createMessageQueue,
  MessageQueue,
} from './utils/index';

const logObj = (obj: any): void => console.log(JSON.stringify(obj));

const getOptionIdByText = (userActLayout: MessageFromServer['userActLayout'], searchedText: string): number => {
  if (userActLayout == null) throw new Error('userActLayout is null');
  const option = userActLayout.flat().find(({ text }) => text === searchedText);
  if (option == null) throw new Error('option is null');
  return option.id;
};

const skipHandshake = async (queue: MessageQueue): Promise<void> => {
  await queue.take();
  await queue.take();
};

const goToIntro = async (queue: MessageQueue): Promise<void> => {
  await skipHandshake(queue);
  queue.send(createMessageToServer(1));
};

describe('Intro test', () => {
  let transport: Transport;
  let queue: MessageQueue;
  let translations: IntroTranslations;
  let translationsActionPlaceholder: string;
  let translationsCommonActions: CommonActionsTranslations;

  const messages: MessageFromServer[] = [];

  beforeAll(async () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line import/no-extraneous-dependencies
    const { MESSAGES } = await import('@translations/ru');
    translations = MESSAGES.intro;
    translationsActionPlaceholder = MESSAGES.actionPlaceholder;
    translationsCommonActions = MESSAGES.commonActions;

    messages.push(
      createMessageFromServer(translations.welcome),
      createMessageFromServer(
        translationsActionPlaceholder,
        [
          [
            { id: 1, text: translations.START_MAIN_SCENARIO, type: 'OTHER' },
            { id: 2, text: translations.GO_TO_TEST_MECHANICS, type: 'OTHER' },
          ],
        ],
      ),
      createMessageFromServer(translations.testDescription),
      createMessageFromServer(
        translationsActionPlaceholder,
        [
          [
            { id: 1, text: translations.TRY_SIMPLE_SCENARIO, type: 'OTHER' },
            { id: 2, text: translations.TRY_DEMO_MERCHANT, type: 'OTHER' },
            { id: 2, text: translations.TRY_DEMO_BATTLE, type: 'OTHER' },
          ],
          [
            { id: 4, text: translations.TRY_DEMO_LOCATION, type: 'OTHER' },
            { id: 5, text: translationsCommonActions.BACK, type: 'BACK' },
          ],
        ],
      ),

    );
  });

  beforeEach(async () => {
    transport = createConnection();
    queue = createMessageQueue(transport);
    await goToIntro(queue);
  });

  afterEach(() => {
    closeConnection(transport);
  });

  it('should send Intro messages', async () => {
    await queue.take();
    const message = await queue.take();
    const optionId = getOptionIdByText(message?.userActLayout, translations.GO_TO_TEST_MECHANICS);
    expect(optionId).toEqual(expect.any(Number));

    queue.send(createMessageToServer(optionId));
    expect(await queue.take()).toEqual({ text: translations.testDescription });
  }, 1000);

  it('should work simple scenario', async () => {
    await queue.take();
    let message = await queue.take();
    let optionId = getOptionIdByText(message?.userActLayout, translations.GO_TO_TEST_MECHANICS);
    queue.send(createMessageToServer(optionId));
    await queue.take();

    message = await queue.take();
    optionId = getOptionIdByText(message?.userActLayout, translations.TRY_SIMPLE_SCENARIO);
    queue.send(createMessageToServer(optionId));
    expect(await queue.take()).toEqual({ text: 'БЕРИ МЕЧ И РУБИ!' });
    // ...........
  }, 1000);

  it('should work demo merchant', async () => {
    await queue.take();
    let message = await queue.take();
    let optionId = getOptionIdByText(message?.userActLayout, translations.GO_TO_TEST_MECHANICS);
    queue.send(createMessageToServer(optionId));
    await queue.take();

    message = await queue.take();
    optionId = getOptionIdByText(message?.userActLayout, translations.TRY_DEMO_MERCHANT);
    queue.send(createMessageToServer(optionId));
    logObj(await queue.take());
    expect(await queue.take()).toEqual({ text: expect.stringMatching(/ты увидел человека за прилавком со всякими склянками/) });
    // ...........
  }, 1000);

  it('should work demo battle', async () => {
    await queue.take();
    let message = await queue.take();
    let optionId = getOptionIdByText(message?.userActLayout, translations.GO_TO_TEST_MECHANICS);
    queue.send(createMessageToServer(optionId));
    await queue.take();

    message = await queue.take();
    optionId = getOptionIdByText(message?.userActLayout, translations.TRY_DEMO_BATTLE);
    queue.send(createMessageToServer(optionId));
    expect(await queue.take()).toEqual({ text: 'На тебя напали.' });
    // ...........
  }, 1000);

  it('should work demo location', async () => {
    await queue.take();
    let message = await queue.take();
    let optionId = getOptionIdByText(message?.userActLayout, translations.GO_TO_TEST_MECHANICS);
    queue.send(createMessageToServer(optionId));
    await queue.take();

    message = await queue.take();
    optionId = getOptionIdByText(message?.userActLayout, translations.TRY_DEMO_LOCATION);
    queue.send(createMessageToServer(optionId));
    expect(await queue.take()).toEqual({ text: expect.stringMatching(/Ты очнулся посреди руин./) });
    // ...........
  }, 1000);
});
