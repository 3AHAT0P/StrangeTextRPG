import EventEmitter from 'events';
import { Telegraf, Markup } from 'telegraf';
import {
  InlineKeyboardButton, InlineKeyboardMarkup, Message, Update,
} from 'telegraf/typings/core/types/typegram';

import { getConfig } from 'ConfigProvider';
import { DropSessionError } from '@utils/Error/DropSessionError';
import logger from '@utils/Logger';

import { AbstractSessionUI } from './AbstractSessionUI';
import {
  StartTheGameCallback, FinishTheGameCallback,
  AdditionalSessionInfo, PersistActionsContainer,
} from './utils';
import { ActionsLayout } from './ActionsLayout';
import { SessionUIProxy } from './SessionUIProxy';

const config = getConfig();

const eventEmitter: EventEmitter = new EventEmitter();

export class TelegramBotInlineUi extends AbstractSessionUI {
  private bot = new Telegraf(config.TELEGRAM_BOT_TOKEN);

  private sendMessageAndSetInlineKeyboard<T extends InlineKeyboardButton>(
    sessionId: string, message: string, actions: T[][],
  ): Promise<Message.TextMessage> {
    return this.bot.telegram.sendMessage(
      sessionId,
      message,
      { disable_notification: true, ...Markup.inlineKeyboard(actions) },
    );
  }

  private deleteMessage(
    message: Message.TextMessage,
  ): Promise<true> {
    return this.bot.telegram.deleteMessage(message.chat.id, message.message_id);
  }

  private updateMessageText(
    message: Message.TextMessage, text: string,
  ): Promise<true | (Update.Edited & Message.TextMessage)> {
    return this.bot.telegram.editMessageText(message.chat.id, message.message_id, void 0, text);
  }

  private updateMessageInlineKeyboard(
    message: Message.TextMessage, keyboard?: InlineKeyboardMarkup,
  ): Promise<true | (Update.Edited & Message)> {
    return this.bot.telegram.editMessageReplyMarkup(message.chat.id, message.message_id, void 0, keyboard);
  }

  private async deleteOrClearMessage(message: Message.TextMessage): Promise<void> {
    try {
      await this.deleteMessage(message);
    } catch (error) {
      await this.updateMessageText(message, '-');
      await this.updateMessageInlineKeyboard(message);
    }
  }

  public async onExit(sessionIds: string[], code: string): Promise<void> {
    await Promise.allSettled(sessionIds.map((sessionId) => this.sendToUser(
      sessionId,
      'Извини, но я нуждаюсь в перезагрузке. Прошу меня извинить. Пожалуйста, нажми /start.',
      true,
    )));
    this.bot.stop(code);
  }

  public async closeSession(sessionId: string): Promise<void> {
    eventEmitter.eventNames().forEach((eventName) => { eventEmitter.emit(eventName, '', true); });
    eventEmitter.removeAllListeners(sessionId);

    await this.sendToUser(
      sessionId,
      'Удачи =)\nЕсли захочешь вернуться и начать сначала нажми на кнопку "Начать новую игру" в закрепленном сообщении.',
      true,
    );
  }

  public init(runOnStart: StartTheGameCallback, runOnFinish: FinishTheGameCallback): this {
    this.bot.command('quit', (ctx) => {
      const sessionId = ctx.message.chat.id.toString();

      setTimeout(runOnFinish, 16, sessionId, this);
      logger.catchAndLogError('TelegramBotInlineUI::OnQuitCommand', ctx.leaveChat());
    });

    this.bot.start(async (ctx) => {
      const listOfCommands = Markup.inlineKeyboard([
        Markup.button.callback('Начать новую игру', 'startNewGame'),
        Markup.button.callback('Закончить игру', 'finishGame'),
        Markup.button.url('Поддержать проект (RUB)', config.DONATE_LINK),
        Markup.button.url('Написать автору отзыв/идею/предложение', config.MAIN_CONTACT),
      ], { columns: 2 });
      await ctx.unpinAllChatMessages();
      const message = await ctx.reply(
        'Привет!\nЯ бот-рассказчик одной маленькой текстовой РПГ.\nЧто тебе интересно?',
        { disable_notification: true, ...listOfCommands },
      );

      // ----------------]
      const t1 = Markup.inlineKeyboard([
        Markup.button.callback('❓ Справка', 'showHelp'),
        Markup.button.callback('⬆️ На север', 'toNorth'),
        Markup.button.callback('🗺 Карта', 'openMap'),

        Markup.button.callback('⬅️ На запад', 'toWest'),
        Markup.button.callback('🎒 Инвентарь', 'openInventory'),
        Markup.button.callback('➡️ На восток', 'toEast'),

        Markup.button.callback('🛏 Отдохнуть', 'sleep'),
        Markup.button.callback('⬇️ На юг', 'toSouth'),
        Markup.button.callback('⚙️ Меню', 'openMenu'),
      ], { columns: 3 });
      const t2 = await ctx.reply(
        'TEST',
        { disable_notification: true, ...t1 },
      );
      await ctx.pinChatMessage(message.message_id, { disable_notification: true });
    });

    this.bot.action('startNewGame', (ctx) => {
      // const sessionId = `${ctx.message.chat.id}_${ctx.message.from.id}`;
      const sessionId = (ctx.chat?.id ?? ctx.callbackQuery.from.id).toString();
      const additionalSessionInfo: AdditionalSessionInfo = {
        playerName: ctx.callbackQuery.from.first_name,
        playerId: ctx.callbackQuery.from.id.toString(),
      };

      const sessionUI = new SessionUIProxy(this, sessionId);
      setTimeout(runOnStart, 16, sessionId, sessionUI, additionalSessionInfo);
    });

    this.bot.action('finishGame', (ctx) => {
      const sessionId = (ctx.chat?.id ?? ctx.callbackQuery.from.id).toString();

      setTimeout(runOnFinish, 16, sessionId, this);
    });

    this.bot.on('callback_query', (ctx) => {
      if ('data' in ctx.callbackQuery) {
        const action = ctx.callbackQuery.data.split('.')[2];
        const eventKey = ctx.callbackQuery.data.split('.').slice(0, 2).join('.');
        eventEmitter.emit(eventKey, action);
      }
    });

    this.bot.on('text', (ctx) => {
      eventEmitter.emit(ctx.message.chat.id.toString(), ctx.message.text);
    });

    this.bot.launch()
      .then((res) => logger.info('TelegramBotInlineUi::init:launch', 'Bot is ready!', res))
      .catch((error) => logger.error('TelegramBotInlineUi::init:launch', error));

    return this;
  }

  public async sendToUser(sessionId: string, message: string, cleanAcions: boolean = false): Promise<void> {
    const keyboard = cleanAcions ? Markup.removeKeyboard() : {};
    await this.bot.telegram.sendMessage(sessionId, message, { disable_notification: true, ...keyboard });
  }

  public interactWithUser<T extends string>(
    sessionId: string, actions: ActionsLayout<T>, validate: (action: T) => boolean = () => true,
  ): Promise<T> {
    if (actions.flatList.length === 0) throw new Error('Action list is empty');

    const message = '——————————————————————————';

    const eventKey = `${sessionId}.${Date.now()}`;
    const buttons = actions.groupedByRows.map(
      (row, rowIndex) => row.map(
        (action, columnIndex) => Markup.button.callback(action, `${eventKey}.${rowIndex}:${columnIndex}`),
      ),
    );

    return new Promise<T>(async (resolve, reject) => {
      const listener = (actionQuery: string, forceReject: boolean = false) => {
        if (forceReject) {
          eventEmitter.off(eventKey, listener);
          return reject(new DropSessionError(`Force drop session ${sessionId}.`));
        }
        const [rowIndex, columnIndex] = actionQuery.split(':');
        const action = actions.groupedByRows[Number(rowIndex)][Number(columnIndex)]; // @TODO: Here may be error.
        if (action != null && validate(action)) {
          eventEmitter.off(sessionId, listener);
          // eslint-disable-next-line @typescript-eslint/no-use-before-define
          logger.catchAndLogError('TelegramBotInlineUI::interactWithUser', this.deleteOrClearMessage(sendedMessage));
          return resolve(action);
        }

        if (action === null) logger.info('TelegramBotInlineUI::interactWithUser', 'Action is null', actionQuery, actions);
      };

      eventEmitter.on(eventKey, listener);
      const sendedMessage = await this.sendMessageAndSetInlineKeyboard(sessionId, message, buttons);
    });
  }

  public async showPersistentActions<T extends string>(
    sessionId: string, message: string, actions: ActionsLayout<T>, actionsListener: (action: T) => void,
  ): Promise<PersistActionsContainer<T>> {
    if (actions.flatList.length === 0) throw new Error('Action list is empty');

    const eventKey = `${sessionId}.persist-${Date.now()}`;
    const buttons = actions.groupedByRows.map(
      (row, rowIndex) => row.map(
        (action, columnIndex) => Markup.button.callback(action, `${eventKey}.${rowIndex}:${columnIndex}`),
      ),
    );
    const listener = (actionQuery: string) => {
      const [rowIndex, columnIndex] = actionQuery.split(':');
      const action = actions.groupedByRows[Number(rowIndex)][Number(columnIndex)]; // @TODO: Here may be error.

      if (action == null) {
        logger.info('TelegramBotInlineUI::showPersistentActions', 'Action is null', actionQuery, actions);
        return;
      }

      setTimeout(actionsListener, 16, action);
    };

    eventEmitter.on(eventKey, listener);
    const sendedMessage = await this.sendMessageAndSetInlineKeyboard(sessionId, message, buttons);
    await this.bot.telegram.pinChatMessage(
      sendedMessage.chat.id, sendedMessage.message_id, { disable_notification: true },
    );

    return {
      updateText: async (newMessage: string) => {
        await this.updateMessageText(sendedMessage, newMessage);
      },
      updateKeyboard: async (newActions: ActionsLayout<T>) => {
        const newButtons = newActions.groupedByRows.map(
          (row, rowIndex) => row.map(
            (action, columnIndex) => Markup.button.callback(action, `${eventKey}.${rowIndex}:${columnIndex}`),
          ),
        );
        const newListener = (actionQuery: string) => {
          const [rowIndex, columnIndex] = actionQuery.split(':');
          const action = newActions.groupedByRows[Number(rowIndex)][Number(columnIndex)]; // @TODO: Here may be error.

          if (action == null) {
            logger.info('TelegramBotInlineUI::showPersistentActions', 'Action is null', actionQuery, actions);
            return;
          }

          setTimeout(actionsListener, 16, action);
        };

        eventEmitter.off(eventKey, listener);
        eventEmitter.on(eventKey, newListener);
        await this.updateMessageInlineKeyboard(sendedMessage, Markup.inlineKeyboard(newButtons).reply_markup);
      },
      delete: async () => {
        await this.bot.telegram.unpinChatMessage(sendedMessage.chat.id, sendedMessage.message_id);
        await this.deleteOrClearMessage(sendedMessage);
        eventEmitter.off(sessionId, listener);
      },
    };
  }
}
