import { Telegraf, Markup } from 'telegraf';

import { getConfig } from 'ConfigProvider';
import logger from '@utils/Logger';
import { safeGet, throwTextFnCarried } from '@utils';

import { SessionUIProxy } from '../SessionUIProxy';

import {
  AbstractSessionUI,
  StartTheGameCallback, FinishTheGameCallback,
  AdditionalSessionInfo,
} from '../@types';
import { BaseUserActSelector } from '../UserActSelectors/BaseUserActSelector';
import { UserActSelectorManager, UserActSelectorType } from '../UserActSelectors/UserActSelectorManager';

const config = getConfig();

export class TelegramBotUi implements AbstractSessionUI {
  private bot = new Telegraf(config.TELEGRAM_BOT_TOKEN);

  private _clientMap = new Map<string, UserActSelectorManager>();

  public async onExit(sessionIds: string[], code: string): Promise<void> {
    await Promise.allSettled(sessionIds.map((sessionId) => this.bot.telegram.sendMessage(
      sessionId,
      'Извини, но я нуждаюсь в перезагрузке. Прошу меня извинить. Пожалуйста, нажми /start.',
      { reply_markup: Markup.removeKeyboard().reply_markup },
    )));
    this.bot.stop(code);
  }

  public async closeSession(sessionId: string): Promise<void> {
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
      logger.catchAndLogError('TelegramBotUI::OnQuitCommand', ctx.leaveChat());
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
        { reply_markup: listOfCommands.reply_markup },
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

    this.bot.launch()
      .then((res) => logger.info('TelegramBotInlineUi::init:launch', 'Bot is ready!', res))
      .catch((error) => logger.error('TelegramBotInlineUi::init:launch', error));

    return this;
  }

  public createUserActSelector(sessionId: string, type: UserActSelectorType): BaseUserActSelector {
    const manager = safeGet(
      this._clientMap.get(sessionId),
      throwTextFnCarried('Manager is null. Incorrect sessionId'),
    );
    const actSelector = manager.create(type);
    return actSelector;
  }

  public getUserActSelector(sessionId: string, type: UserActSelectorType): BaseUserActSelector {
    const manager = safeGet(
      this._clientMap.get(sessionId),
      throwTextFnCarried('Manager is null. Incorrect sessionId'),
    );
    const actSelector = manager.takeOrCreate(type);
    manager.add(type, actSelector);
    return actSelector;
  }

  public async sendToUser(sessionId: string, message: string, cleanAcions: boolean = false): Promise<void> {
    if (cleanAcions) await this.bot.telegram.sendMessage(sessionId, message, Markup.removeKeyboard());
    else await this.bot.telegram.sendMessage(sessionId, message);
  }
}
