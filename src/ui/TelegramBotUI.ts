import EventEmitter from 'events';
import { Telegraf, Markup } from 'telegraf'

import config from '../../.env.json';
import { AbstractSessionUI } from './AbstractSessionUI';

import { MessageType } from "./AbstractUI";

export interface AdditionalSessionInfo {
  playerName: string;
  playerId: string;
}

export type StartTheGameCallback = (
  sessionId: string,
  ui: AbstractSessionUI,
  additionalSessionInfo: AdditionalSessionInfo,
) => Promise <void>;

export const MessageTypes: Record<MessageType, []> = {
  default: [],
  damageDealt: [],
  damageTaken: [],
  option: [],
  stats: [],
}

const eventEmitter = new EventEmitter();

export class TelegramBotUi extends AbstractSessionUI {
  private bot = new Telegraf(config.TELEGRAM_BOT_TOKEN);

  public async onExit(sessionIds: string[], code: string): Promise<void> {
    sessionIds.map((sessionId) => this.bot.telegram.sendMessage(
      sessionId,
      'Bot is reloading. Please use /start again.',
      { reply_markup: Markup.removeKeyboard().reply_markup },
    ));
    this.bot.stop(code);
  }

  public async closeSession(sessionId: string): Promise<void> {
    await this.bot.telegram.sendMessage(
      sessionId,
      'Удачи =)\nЕсли захочешь вернуться и начать сначала нажми /start.',
      { reply_markup: Markup.removeKeyboard().reply_markup },
    );
  }

  public init(runOnStart: StartTheGameCallback): this {
    this.bot.command('quit', (ctx) => {
      ctx.leaveChat()
    });

    this.bot.start((ctx) => {
      // const sessionId = `${ctx.message.chat.id}_${ctx.message.from.id}`;
      const sessionId = ctx.message.chat.id.toString();
      const additionalSessionInfo: AdditionalSessionInfo = {
        playerName: ctx.message.from.first_name,
        playerId: ctx.message.from.id.toString(),
      }

      setTimeout(runOnStart, 16, sessionId, this, additionalSessionInfo);
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
    await this.bot.telegram.sendMessage(sessionId, message);
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
    return new Promise((resolve) => {
      if (options == null || options.length === 0) this.sendToUser(sessionId, message, 'default');
      else this.sendOptionsToUser(sessionId, message, options);
      const listener = (option: string) => {
        const optionId = options.indexOf(option);
        if (optionId >= 0) {
          eventEmitter.off(sessionId, listener);
          resolve(option);
        }
      }
      eventEmitter.on(sessionId, listener);
    });
  }
}

