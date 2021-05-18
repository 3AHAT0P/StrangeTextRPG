import EventEmitter from 'events';
import { Telegraf, Markup } from 'telegraf';
import { InlineKeyboardButton, Message } from 'telegraf/typings/core/types/typegram';

import { DropSessionError } from '@utils/Error/DropSessionError';

import config from '../../.env.json';

import {
  AbstractSessionUI, AdditionalSessionInfo,
  FinishTheGameCallback, StartTheGameCallback,
} from './AbstractSessionUI';
import { ActionsLayout } from './ActionsLayout';

const eventEmitter: EventEmitter = new EventEmitter();

export class TelegramBotUi extends AbstractSessionUI {
  private bot = new Telegraf(config.TELEGRAM_BOT_TOKEN);

  private sendMessageAndSetKeyboard<T extends string>(
    sessionId: string, message: string, actions: ActionsLayout<T>,
  ): Promise<Message.TextMessage> {
    return this.bot.telegram.sendMessage(
      sessionId,
      message,
      Markup.keyboard(actions.grooupedByRows).resize(),
    );
  }

  private sendMessageAndSetInlineKeyboard<T extends InlineKeyboardButton>(
    sessionId: string, message: string, actions: T[][],
  ): Promise<Message.TextMessage> {
    return this.bot.telegram.sendMessage(
      sessionId,
      message,
      Markup.inlineKeyboard(actions),
    );
  }

  public async onExit(sessionIds: string[], code: string): Promise<void> {
    await Promise.allSettled(sessionIds.map((sessionId) => this.bot.telegram.sendMessage(
      sessionId,
      'Извини, но я нуждаюсь в перезагрузке. Прошу меня извинить. Пожалуйста, нажми /start.',
      { reply_markup: Markup.removeKeyboard().reply_markup },
    )));
    this.bot.stop(code);
  }

  public async closeSession(sessionId: string): Promise<void> {
    eventEmitter.emit(sessionId, '', true);
    eventEmitter.removeAllListeners(sessionId);

    await this.bot.telegram.sendMessage(
      sessionId,
      'Удачи =)\nЕсли захочешь вернуться и начать сначала нажми на кнопку "Начать новую игру" в закрепленном сообщении.',
      { reply_markup: Markup.removeKeyboard().reply_markup },
    );
  }

  public init(runOnStart: StartTheGameCallback, runOnFinish: FinishTheGameCallback): this {
    this.bot.command('quit', (ctx) => {
      const sessionId = ctx.message.chat.id.toString();

      setTimeout(runOnFinish, 16, sessionId, this);
      void ctx.leaveChat();
    });

    this.bot.start(async (ctx) => {
      const listOfCommands = Markup.inlineKeyboard([
        Markup.button.callback('Начать новую игру', 'startNewGame'),
        Markup.button.callback('Закончить игру', 'finishGame'),
        Markup.button.url('Поддержать проект (RUB)', 'https://www.tinkoff.ru/sl/5ZlcyYuMcv5'),
        Markup.button.url('Написать автору отзыв/идею/предложение', 'https://t.me/ikostyakov'),
      ], { columns: 2 });
      await ctx.unpinAllChatMessages();
      const message = await ctx.reply(
        'Привет!\nЯ бот-рассказчик одной маленькой текстовой РПГ.\nЧто тебе интересно?',
        { reply_markup: listOfCommands.reply_markup },
      );
      await ctx.pinChatMessage(message.message_id, { disable_notification: true });
    });

    this.bot.action('startNewGame', async (ctx) => {
      // const sessionId = `${ctx.message.chat.id}_${ctx.message.from.id}`;
      const sessionId = (ctx.chat?.id ?? ctx.callbackQuery.from.id).toString();
      // const additionalSessionInfo: AdditionalSessionInfo = {
      //   playerName: ctx.callbackQuery.from.first_name,
      //   playerId: ctx.callbackQuery.from.id.toString(),
      // };

      // setTimeout(runOnStart, 16, sessionId, this, additionalSessionInfo);

      const al = new ActionsLayout<[string, string]>()
        .addRow(['ping x', 'x-ping'], ['pong x', 'x-pong'])
        .addRow(['ping y', 'y-ping'], ['pong y', 'y-pong']);

      this.inlineInteractWithUser(sessionId, 'TEST-X', al)
        .then((action) => console.log('!@#!@#!@#!@#!@', action))
        .catch(() => 42);
    });

    this.bot.action('finishGame', (ctx) => {
      const sessionId = (ctx.chat?.id ?? ctx.callbackQuery.from.id).toString();

      setTimeout(runOnFinish, 16, sessionId, this);
    });

    this.bot.on('callback_query', (ctx) => {
      const sessionId = (ctx.chat?.id ?? ctx.callbackQuery.from.id).toString();
      if ('data' in ctx.callbackQuery) {
        console.log('!!!!!!!!!!!!!!!!!!!!2', sessionId, ctx.callbackQuery.data);
        const action = ctx.callbackQuery.data.split('.')[2];
        const eventKey = ctx.callbackQuery.data.split('.').slice(0, 2).join('.');
        console.log('!!!!!!!!!!!!!!!!!!!!3', action, eventKey);
        eventEmitter.emit(eventKey, action);
      }
    });

    // this.bot.on('message', (ctx) => {
    //   ctx.reply(`Hello ${ctx.state.role}`);
    // })

    this.bot.on('text', (ctx) => {
      eventEmitter.emit(ctx.message.chat.id.toString(), ctx.message.text);
    });

    this.bot.launch()
      .then((res) => console.log('Bot is ready!', res))
      .catch((error) => console.error(error));

    return this;
  }

  public async sendToUser(sessionId: string, message: string, cleanAcions: boolean = false): Promise<void> {
    if (cleanAcions) await this.bot.telegram.sendMessage(sessionId, message, Markup.removeKeyboard());
    else await this.bot.telegram.sendMessage(sessionId, message);
  }

  public interactWithUser<T extends string>(sessionId: string, message: string, actions: ActionsLayout<T>): Promise<T> {
    if (actions.flatList.length === 0) throw new Error('Action list is empty');

    return new Promise<T>((resolve, reject) => {
      const listener = (action: T, forceReject: boolean = false) => {
        if (forceReject) {
          eventEmitter.off(sessionId, listener);
          return reject(new DropSessionError(`Force drop session ${sessionId}.`));
        }
        if (actions.flatList.includes(action)) {
          eventEmitter.off(sessionId, listener);
          return resolve(action);
        }
      };

      eventEmitter.on(sessionId, listener);
      void this.sendMessageAndSetKeyboard(sessionId, message, actions);
    });
  }

  public inlineInteractWithUser<T extends [string, string]>(
    sessionId: string, message: string, actions: ActionsLayout<T>,
  ): Promise<T> {
    if (actions.flatList.length === 0) throw new Error('Action list is empty');

    const eventKey = `${sessionId}.${Date.now()}`;
    const buttons = actions.grooupedByRows.map(
      (row) => row.map((action) => Markup.button.callback(action[0], `${eventKey}.${action[1]}`)),
    );

    console.log(eventKey);

    return new Promise<T>(async (resolve, reject) => {
      const listener = (action: T, forceReject: boolean = false) => {
        if (forceReject) {
          eventEmitter.off(eventKey, listener);
          return reject(new DropSessionError(`Force drop session ${sessionId}.`));
        }
        console.log('$$$$$$$$$$$$$$$$$', eventKey, action);
        eventEmitter.off(sessionId, listener);
        void this.bot.telegram.editMessageReplyMarkup(
          // eslint-disable-next-line @typescript-eslint/no-use-before-define
          sendedMessage.chat.id, sendedMessage.message_id, void 0, void 0,
        );
        return resolve(action);
        // if (actions.flatList.includes(action)) {
        //   eventEmitter.off(sessionId, listener);
        //   return resolve(action);
        // }
      };

      eventEmitter.on(eventKey, listener);
      const sendedMessage = await this.sendMessageAndSetInlineKeyboard(sessionId, message, buttons);
    });
  }
}
