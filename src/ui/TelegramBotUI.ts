import EventEmitter from 'events';
import { Telegraf, Markup } from 'telegraf'

import config from '../../.env.json';
import { DropSessionError } from '../utils/Error/DropSessionError';

import { AbstractSessionUI, AdditionalSessionInfo, FinishTheGameCallback, StartTheGameCallback } from './AbstractSessionUI';

import { MessageType } from "./AbstractUI";

export const MessageTypes: Record<MessageType, []> = {
  default: [],
  damageDealt: [],
  damageTaken: [],
  option: [],
  stats: [],
  markdown: [],
  clean: [],
}

const eventEmitter: EventEmitter = new EventEmitter();

export class TelegramBotUi extends AbstractSessionUI {
  private bot = new Telegraf(config.TELEGRAM_BOT_TOKEN);

  public async onExit(sessionIds: string[], code: string): Promise<void> {
    sessionIds.map((sessionId) => this.bot.telegram.sendMessage(
      sessionId,
      'Извини, но я нуждаюсь в перезагрузке. Прошу меня извинить. Пожалуйста, нажми /start.',
      { reply_markup: Markup.removeKeyboard().reply_markup },
    ));
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
      ctx.leaveChat()
    });

    this.bot.start(async (ctx) => {
      const listOfCommands = Markup.inlineKeyboard([
        Markup.button.callback('Начать новую игру', 'startNewGame'),
        Markup.button.callback('Закончить игру', 'finishGame'),
        Markup.button.url('Поддержать проект (RUB)', 'https://www.tinkoff.ru/sl/5ZlcyYuMcv5'),
        Markup.button.url('Написать автору отзыв/идею/предложение', 'https://t.me/ikostyakov'),
      ], { columns: 2 });
      await ctx.unpinAllChatMessages();
      const message = await ctx.reply(`Привет!\nЯ бот-рассказчик одной маленькой текстовой РПГ.\nЧто тебе интересно?`, { reply_markup: listOfCommands.reply_markup });
      await ctx.pinChatMessage(message.message_id, { disable_notification: true });
    });

    this.bot.action('startNewGame', (ctx) => {
      // const sessionId = `${ctx.message.chat.id}_${ctx.message.from.id}`;
      const sessionId = (ctx.chat?.id ?? ctx.callbackQuery.from.id).toString();
      const additionalSessionInfo: AdditionalSessionInfo = {
        playerName: ctx.callbackQuery.from.first_name,
        playerId: ctx.callbackQuery.from.id.toString(),
      };

      setTimeout(runOnStart, 16, sessionId, this, additionalSessionInfo);
    });

    this.bot.action('finishGame', (ctx) => {
      const sessionId = (ctx.chat?.id ?? ctx.callbackQuery.from.id).toString();

      setTimeout(runOnFinish, 16, sessionId, this);
    });

    // this.bot.on('message', (ctx) => {
    //   ctx.reply(`Hello ${ctx.state.role}`);
    // })

    this.bot.on('text', (ctx) => {
      eventEmitter.emit(ctx.message.chat.id.toString(), ctx.message.text);
    });

    this.bot.launch();

    return this;
  }

  public async sendToUser(sessionId: string, message: string, type: MessageType): Promise<void> {
    if (type === 'clean') await this.bot.telegram.sendMessage(sessionId, message, { reply_markup: Markup.removeKeyboard().reply_markup });
    else await this.bot.telegram.sendMessage(sessionId, message);
  }

  public async sendOptionsToUser(sessionId: string, message: string, options: string[]): Promise<void> {
    await this.bot.telegram.sendMessage(
      sessionId,
      message,
      Markup.keyboard(options).resize(),
    );
  }

  /**
   * waitInteraction
   */
  public waitInteraction(sessionId: string): Promise<string> {
    return new Promise((resolve) => {
      eventEmitter.once(sessionId, resolve);
    });
  }

  public interactWithUser(sessionId: string, message: string, options: string[]): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const listener = (option: string, forceReject: boolean = false) => {
        if (forceReject) {
          eventEmitter.off(sessionId, listener);
          return reject(new DropSessionError(`Force drop session ${sessionId}.`));
        }
        const optionId = options.indexOf(option);
        if (optionId >= 0) {
          eventEmitter.off(sessionId, listener);
          return resolve(option);
        }
      };
      eventEmitter.on(sessionId, listener);
      if (options == null || options.length === 0) this.sendToUser(sessionId, message, 'default');
      else this.sendOptionsToUser(sessionId, message, options);
    });
  }
}

