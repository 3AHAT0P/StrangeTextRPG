import { io, Socket } from 'socket.io-client';

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
}

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

export const createMessageQueue = (socket: Transport): MessageQueue => {
  const internalGenerator = function* internalGenerator(): Generator<Promise<MessageFromServer>, void, void> {
    const queue: MessageFromServer[] = [];
    socket.on('MESSAGE', (message: MessageFromServer) => queue.push(message));

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

  return {
    take: () => iterator.next().value,
    send: (answer: AnswerToServer) => sendAnswer(socket, answer),
  };
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
