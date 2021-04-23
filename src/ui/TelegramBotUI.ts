import EventEmitter from 'events';
import { Telegraf, Markup } from 'telegraf'

import config from '../../.env.json';
import { AbstractSessionUI } from './AbstractSessionUI';

import { MessageType } from "./AbstractUI";

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

  public init(runOnStart: (sessionId: string, ui: AbstractSessionUI) => Promise<void>): this {
    this.bot.command('quit', (ctx) => {
      // Using context shortcut
      ctx.leaveChat()
    })
    this.bot.start((ctx) => {
      // const sessionId = `${ctx.message.chat.id}_${ctx.message.from.id}`;
      const sessionId = ctx.message.chat.id.toString();
      // sessionQueueMap.set(sessionId, []);

      console.log('!@#!@#!@!@#, start');

      setTimeout(runOnStart, 16, sessionId, this);
      // this.sendOptionsToUser(['ВЗЯТЬ МЕЧ', 'ПОПЫТАТЬСЯ ОСМОТРЕТЬСЯ']);
    })

    // this.bot.on('message', (ctx) => {
    //   console.log('!@#!@#!@#!@#!@#!@ message', ctx.message);
    //   ctx.reply(`Hello ${ctx.state.role}`);
    // })

    this.bot.on('text', (ctx) => {
      // Using context shortcut
      console.log('!@#!@#!@#!@#!@#!@ text', ctx.message.text);
      // const queue = sessionQueueMap.get(ctx.message.chat.id.toString());
      // if (queue != null) queue.push(ctx.message.text);
      eventEmitter.emit(ctx.message.chat.id.toString(), ctx.message.text);
    })

    this.bot.launch()

    // Enable graceful stop
    process.once('SIGINT', () => this.bot.stop('SIGINT'));
    process.once('SIGTERM', () => this.bot.stop('SIGTERM'));

    return this;
  }

  public sendToUser(sessionId: string, message: string, type: MessageType): void {
    console.log('sendToUser');
    this.bot.telegram.sendMessage(sessionId, message)
    
  }

  public sendOptionsToUser(sessionId: string, message: string, options: string[]) {
    this.bot.telegram.sendMessage(
      sessionId,
      message,
      Markup.keyboard(options).oneTime().resize(),
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
        console.log('QWEQWEQEQE', sessionId, option, options, optionId);
        if (optionId >= 0){
          eventEmitter.off(sessionId, listener);
          resolve(option);
        }
      }
      eventEmitter.on(sessionId, listener);
    });
  }
}

