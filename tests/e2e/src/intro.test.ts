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
  getOptionIdByText,
  logObj,
  getOptionIdByType,
  pipeAsync,
} from './utils/index';

const skipHandshake = async (queue: MessageQueue): Promise<void> => {
  await queue.take();
  await queue.take();
};

const goToIntro = async (queue: MessageQueue): Promise<void> => {
  await skipHandshake(queue);
  queue.send(createMessageToServer(1));
};

const waitUntil = async (
  queue: MessageQueue,
  condition: (message: MessageFromServer) => boolean,
): Promise<MessageFromServer> => {
  while (true) {
    const message = await queue.take();
    if (message == null) throw new Error('Message is null');
    if (condition(message)) return message;
  }
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
            { id: 1, text: translations.TRY_DEMO_LOCATION, type: 'OTHER' },
            { id: 2, text: translations.TRY_DEMO_MERCHANT, type: 'OTHER' },
            { id: 3, text: translations.TRY_DEMO_BATTLE, type: 'OTHER' },
          ],
          [
            { id: 4, text: translations.TRY_SIMPLE_SCENARIO, type: 'OTHER' },
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
    expect(await queue.take()).toEqual(messages[0]);
    const message = await queue.take();
    expect(message).toEqual(messages[1]);
    const optionId = getOptionIdByText(message?.userActLayout, translations.GO_TO_TEST_MECHANICS);
    expect(optionId).toEqual(expect.any(Number));

    queue.send(createMessageToServer(optionId));
    expect(await queue.take()).toEqual(messages[2]);
    expect(await queue.take()).toEqual(messages[3]);
  }, 1000);
});
describe('Demo mechanics test', () => {
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
            { id: 1, text: translations.TRY_DEMO_LOCATION, type: 'OTHER' },
            { id: 2, text: translations.TRY_DEMO_MERCHANT, type: 'OTHER' },
            { id: 3, text: translations.TRY_DEMO_BATTLE, type: 'OTHER' },
          ],
          [
            { id: 4, text: translations.TRY_SIMPLE_SCENARIO, type: 'OTHER' },
            { id: 5, text: translationsCommonActions.BACK, type: 'BACK' },
          ],
        ],
      ),

    );
  });

  describe('Simple scenario test', () => {
    let finishMessage: MessageFromServer;

    beforeAll(() => {
      finishMessage = createMessageFromServer(
        translationsActionPlaceholder,
        [
          [
            { id: 1, text: 'Вернутся к выбору локаций', type: 'OTHER' },
            { id: 2, text: 'ВСЕ! ХВАТИТ С МЕНЯ!', type: 'EXIT_LOCATION' },
            { id: 3, text: 'Перезагрузить локацию', type: 'RELOAD' },
          ],
        ],
      );
    });

    beforeEach(async () => {
      transport = createConnection();
      queue = createMessageQueue(transport);
      await goToIntro(queue);
      await queue.take();
      await queue.takeAndAnswerByText(translations.GO_TO_TEST_MECHANICS);
      await queue.take();
      await queue.takeAndAnswerByText(translations.TRY_SIMPLE_SCENARIO);
    });

    afterEach(() => {
      closeConnection(transport);
    });

    it('user should die', async () => {
      expect(await queue.take()).toEqual({ text: 'БЕРИ МЕЧ И РУБИ!' });

      await queue.takeAndAnswerByText('ПОПЫТАТЬСЯ ОСМОТРЕТЬСЯ');
      expect(await queue.take()).toEqual({ text: expect.stringMatching(/Вы проиграли/) });
      expect(await queue.take()).toEqual({ text: expect.stringMatching(/что дальше/) });
      expect(await queue.take()).toEqual(finishMessage);
    }, 1000);

    it('user should win', async () => {
      expect(await queue.take()).toEqual({ text: 'БЕРИ МЕЧ И РУБИ!' });

      await queue.takeAndAnswerByText('ВЗЯТЬ МЕЧ');
      expect(await queue.take()).toEqual({ text: expect.stringMatching(/Ладонь сжимает рукоять меча/) });
      await queue.takeAndAnswerByText('РУБИТЬ');
      expect(await queue.take()).toEqual({ text: expect.stringMatching(/Воздух свистит, рассекаемый сталью/) });
      await queue.takeAndAnswerByText('Дальше?');
      expect(await queue.take()).toEqual({ text: 'Продолжение следует...' });
      expect(await queue.take()).toEqual({ text: 'Ну и что дальше?' });
      expect(await queue.take()).toEqual(finishMessage);
    }, 2000);
  });

  describe('Demo merchant test', () => {
    beforeEach(async () => {
      transport = createConnection();
      queue = createMessageQueue(transport);
      await goToIntro(queue);
      await queue.take();
      await queue.takeAndAnswerByText(translations.GO_TO_TEST_MECHANICS);
      await queue.take();
      await queue.takeAndAnswerByText(translations.TRY_DEMO_MERCHANT);
    });

    afterEach(() => {
      closeConnection(transport);
    });

    it('user should buy', async () => {
      expect(await queue.take()).toEqual({ text: expect.stringMatching(/ты увидел человека за прилавком со всякими склянками/) });
      await queue.takeAndAnswerByPattern(/Поговорить с торговцем/);
      expect(await queue.take()).toEqual({ text: expect.stringMatching(/\[Ты\]: Привет/) });
      expect(await queue.take()).toEqual({ text: expect.stringMatching(/\[[^\]]*\]: Привет/) });

      // wait until
      while (true) {
        const message = await queue.take();
        if (message == null) throw new Error('Message is null');
        if (/Чего изволишь\?/.test(message.text)) break;
      }
      await queue.takeAndAnswerByText('Купить маленькое зелье лечения');
      expect(await queue.take()).toEqual({ text: expect.stringMatching(/Ты купил маленькое зелье лечения x1/) });
      expect(await queue.take()).toEqual({ text: expect.stringMatching(/У тебя осталось \d+ золота/) });
      expect(await queue.take()).toEqual({ text: expect.stringMatching(/\[[^\]]*\]: Чего изволишь\?/) });

      await queue.takeAndAnswerByText('Купить маленькое зелье лечения');
      expect(await queue.take()).toEqual({ text: expect.stringMatching(/Ты купил маленькое зелье лечения x1/) });
      expect(await queue.take()).toEqual({ text: expect.stringMatching(/У тебя осталось \d+ золота/) });
      expect(await queue.take()).toEqual({ text: expect.stringMatching(/\[[^\]]*\]: Чего изволишь\?/) });

      await queue.takeAndAnswerByText('Купить маленькое зелье лечения');
      expect(await queue.take()).toEqual({ text: expect.stringMatching(/у тебя не хватает золота/) });
      expect(await queue.take()).toEqual({ text: expect.stringMatching(/\[[^\]]*\]: Чего изволишь\?/) });

      await queue.takeAndAnswerByPattern(/Ничего/);
      expect(await queue.take()).toEqual({ text: expect.stringMatching(/\[Ты\]: Ничего/) });
      expect(await queue.take()).toEqual({ text: expect.stringMatching(/\[[^\]]*\]: Приходи еще/) });
      expect(await queue.take()).toEqual(createMessageFromServer(translations.welcome));
    }, 5000);
  });

  describe('Demo battle test', () => {
    let finishMessage: MessageFromServer;

    beforeAll(() => {
      finishMessage = createMessageFromServer(
        translationsActionPlaceholder,
        [
          [
            { id: 1, text: 'Вернутся к выбору локаций', type: 'OTHER' },
            { id: 2, text: 'Перезагрузить локацию', type: 'RELOAD' },
          ],
        ],
      );
    });

    beforeEach(async () => {
      transport = createConnection();
      queue = createMessageQueue(transport);
      await goToIntro(queue);
      await queue.take();
      await queue.takeAndAnswerByText(translations.GO_TO_TEST_MECHANICS);
      await queue.take();
      await queue.takeAndAnswerByText(translations.TRY_DEMO_BATTLE);
    });

    afterEach(() => {
      closeConnection(transport);
    });

    it('user should fight', async () => {
      expect(await queue.take()).toEqual({ text: 'Загружаю тренировочный бой...' });
      expect(await queue.take()).toEqual({ text: expect.stringMatching(/Ты встретил/) });
      await queue.takeAndAnswerByType('ATTACK');
      await queue.takeAndAnswerByType('ATTACK_0');

      // wait until
      while (true) {
        const message = await queue.take();
        // logObj(message);
        if (message == null) throw new Error('Message is null');
        if (/Ты победил/.test(message.text)) break;
        if (/ты умер/.test(message.text)) break;
        if (message.text === translationsActionPlaceholder && message.userActLayout != null) {
          if (message.userActLayout.length > 1) {
            queue.send(createMessageToServer(1));
          } else break;
        }
      }
      expect(await queue.take()).toEqual({ text: expect.stringMatching(/Что дальше\?/) });
      expect(await queue.take()).toEqual(finishMessage);
    }, 5000);

    it('user should examine', async () => {
      expect(await queue.take()).toEqual({ text: 'Загружаю тренировочный бой...' });
      expect(await queue.take()).toEqual({ text: expect.stringMatching(/Ты встретил/) });
      await queue.takeAndAnswerByType('EXAMINE');
      await queue.takeAndAnswerByType('EXAMINE_0');
      expect(await queue.take()).toEqual({ text: expect.stringMatching(/осматриваешь/) });
      expect(await queue.take()).toEqual({ text: expect.stringMatching(/Xарактеристики/) });
      expect(await queue.take()).toEqual({ text: expect.stringMatching(/Крыса №1 нанес Тебе/) });
      expect(await queue.take()).toEqual({ text: expect.stringMatching(/Результаты раунда/) });
      await queue.takeAndAnswerByType('EXAMINE_1');

      // wait until
      while (true) {
        const message = await queue.take();
        if (message == null) throw new Error('Message is null');
        if (/ты умер/.test(message.text)) break;
        if (message.text === translationsActionPlaceholder && message.userActLayout != null) {
          if (message.userActLayout.length > 1) {
            queue.send(createMessageToServer(1));
          } else break;
        }
      }
      expect(await queue.take()).toEqual({ text: expect.stringMatching(/Что дальше\?/) });
      expect(await queue.take()).toEqual(finishMessage);
    }, 10000);
  });

  describe('Demo location test', () => {
    let finishMessage: MessageFromServer;

    beforeAll(() => {
      finishMessage = createMessageFromServer(
        translationsActionPlaceholder,
        [
          [
            { id: 1, text: 'Вернутся к выбору локаций', type: 'OTHER' },
            { id: 2, text: 'Перезагрузить локацию', type: 'RELOAD' },
          ],
        ],
      );
    });

    beforeEach(async () => {
      transport = createConnection();
      queue = createMessageQueue(transport, true);
      await goToIntro(queue);
      await queue.take();
      await queue.takeAndAnswerByText(translations.GO_TO_TEST_MECHANICS);
      await queue.take();
      await queue.takeAndAnswerByText(translations.TRY_DEMO_LOCATION);
    });

    afterEach(() => {
      closeConnection(transport);
    });

    it('user should ???', async () => {
      expect(await queue.take()).toEqual({ text: expect.stringMatching(/Ты очнулся посреди руин./) });
      await queue.takeAndAnswerByText('Встать');
      expect(await queue.take()).toEqual({ text: expect.stringMatching(/Ты аккуратно встаешь/) });
      await queue.takeAndAnswerByType('MOVE_TO_WEST');

      const boundedWaitUntilActionSelector = waitUntil.bind(
        null,
        queue,
        ({ text, userActLayout }) => text === translationsActionPlaceholder && userActLayout != null,
      );

      const skipTextAndMove = async (moveActType: `MOVE_TO_${'WEST' | 'NORTH' | 'SOUTH' | 'EAST'}`): Promise<void> => {
        await pipeAsync(
          boundedWaitUntilActionSelector,
          async (message: MessageFromServer): Promise<void> => queue.sendByType(message, moveActType),
        )(void 0);
      };

      await skipTextAndMove('MOVE_TO_WEST');
      await skipTextAndMove('MOVE_TO_NORTH');

      const message = await queue.take();
      if (typeof getOptionIdByType(message?.userActLayout, 'ATTACK') !== 'number') {
        await skipTextAndMove('MOVE_TO_NORTH');
        if (typeof getOptionIdByType(message?.userActLayout, 'ATTACK') !== 'number') {
          await skipTextAndMove('MOVE_TO_SOUTH');
          expect(getOptionIdByType(message?.userActLayout, 'ATTACK')).toEqual(expect.any(Number));
        }
      }

      await queue.take();
      await queue.take();
      await queue.take();
      await queue.take();
      await queue.take();
    }, 5000);
  });
});
