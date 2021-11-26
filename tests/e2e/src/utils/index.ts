import { io, Socket } from 'socket.io-client';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { pipe, pipeAsync } from '../../../../src/utils/pipe';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { UserAction } from '../../../../src/ui/UserActSelectors/BaseUserActSelector';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { MessageToClient, AnswerFromClient } from '../../../../src/ui/SocketUI/UserActSelectorSocketAdapter';

const CONNECTION_STRING = 'ws://localhost:8888';

export type Transport = Socket;

export { UserAction };

export type MessageFromServer = MessageToClient;

export type AnswerToServer = AnswerFromClient;

export interface MessageQueue {
  take: () => void | Promise<MessageToClient>;
  send: (answer: AnswerToServer) => void;
  sendByType: (message: MessageFromServer | null | void, type: UserAction['type']) => void;
  takeAndAnswerByText: (text: string) => Promise<void>;
  takeAndAnswerByPattern: (pattern: RegExp) => Promise<void>;
  takeAndAnswerByType: (type: UserAction['type']) => Promise<void>;
}

export const logObj = (obj: any): void => console.log(JSON.stringify(obj));

export const getOptionIdByText = (userActLayout: MessageFromServer['userActLayout'], searchedText: string): number => {
  if (userActLayout == null) throw new Error('userActLayout is null');
  const option = userActLayout.flat().find(({ text }) => text === searchedText);
  if (option == null) throw new Error('option is null');
  return option.id;
};

export const getOptionIdByPattern = (userActLayout: MessageFromServer['userActLayout'], pattern: RegExp): number => {
  if (userActLayout == null) throw new Error('userActLayout is null');
  const option = userActLayout.flat().find(({ text }) => pattern.test(text));
  if (option == null) throw new Error('option is null');
  return option.id;
};

export const getOptionIdByType = (userActLayout: MessageFromServer['userActLayout'], searchedType: UserAction['type']): number => {
  if (userActLayout == null) throw new Error('userActLayout is null');
  const option = userActLayout.flat().find(({ type }) => type === searchedType);
  if (option == null) throw new Error('option is null');
  return option.id;
};

export const createConnection = (): Transport => {
  const socket = io(CONNECTION_STRING);
  return socket;
};

export const waitConnection = (socket: Transport): Promise<void> => new Promise(
  (resolve) => { socket.once('connect', resolve); },
);

export const waitMessage = (socket: Transport): Promise<MessageFromServer> => new Promise(
  (resolve) => { socket.once('MESSAGE', resolve); },
);

export const sendAnswer = (socket: Transport, answer: AnswerToServer): void => {
  socket.emit('ANSWER', answer);
};

export const closeConnection = (socket: Transport): void => {
  socket.close();
};

export const createMessageFromServer = (
  text: MessageFromServer['text'],
  options: MessageFromServer['userActLayout'] | null = null,
): MessageFromServer => {
  if (options === null) return { text };

  return {
    text,
    userActLayout: options,
    needAnswer: true,
  };
};

export const createMessageToServer = (optionId: UserAction['id']): AnswerToServer => ({
  answer: optionId,
});

export const createMessageQueue = (socket: Transport, needLog: boolean = false): MessageQueue => {
  const internalGenerator = function* internalGenerator(): Generator<Promise<MessageFromServer>, void, void> {
    const queue: MessageFromServer[] = [];
    socket.on('MESSAGE', (message: MessageFromServer) => {
      if (needLog) console.log('SOCKET ON MESSAGE:', JSON.stringify(message));
      queue.push(message);
    });

    const f = (resolve: (data: MessageFromServer) => void, reject: (error: Error) => void, index = 0) => {
      const item = queue.shift();
      if (item != null) resolve(item);
      else if (index > 2) reject(new Error('Have no data!'));
      else setTimeout(f, 250, resolve, reject, index);
    };

    while (true) {
      yield new Promise(f);
    }
  };

  const iterator = internalGenerator();

  const queue = {
    take: () => iterator.next().value,
    send: (answer: AnswerToServer) => sendAnswer(socket, answer),
    sendByType: (message: MessageFromServer | null | void, type: UserAction['type']): void => {
      if (message == null) throw new Error('Message is null');
      pipe(
        getOptionIdByType.bind(null, message.userActLayout, type),
        createMessageToServer,
        queue.send,
      )(void 0);
    },
    takeAndAnswerByText: async (text: string): Promise<void> => {
      const message = await queue.take();
      const optionId = getOptionIdByText(message?.userActLayout, text);
      queue.send(createMessageToServer(optionId));
    },
    takeAndAnswerByPattern: async (pattern: RegExp): Promise<void> => {
      const message = await queue.take();
      const optionId = getOptionIdByPattern(message?.userActLayout, pattern);
      queue.send(createMessageToServer(optionId));
    },
    takeAndAnswerByType: async (type: UserAction['type']): Promise<void> => {
      queue.sendByType(await queue.take(), type);
    },
  };

  return queue;
};

export { pipe, pipeAsync };
