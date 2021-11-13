import { Telegraf, Markup, Context } from 'telegraf';
import { Update, Message, InlineKeyboardButton } from 'telegraf/typings/core/types/typegram';

import { UserAction } from '../UserActSelectors/BaseUserActSelector';
import { UserActSelectorAbstractAdapter } from '../UserActSelectorAbstractAdapter';

export class UserActSelectorTelegramBotInlineAdapter extends UserActSelectorAbstractAdapter {
  declare protected _transport: Telegraf<Context<Update>>;

  private _message: Message.TextMessage | null = null;

  private _defaultMessageText: string = '——————————————————————————';

  private _transformButtons(layout: UserAction[][]): InlineKeyboardButton[][] {
    const eventKey = `${this._sessionId}.${Date.now()}`;
    return layout.map(
      (row) => row.map(
        (action) => Markup.button.callback(action.text, `${eventKey}.${action.id}`),
      ),
    );
  }

  init() {
    this._transport.on('callback_query', async (ctx) => {
      if ('data' in ctx.callbackQuery) {
        const [sessionId, , actionId] = ctx.callbackQuery.data.split('.');
        if (this._sessionId === sessionId && !Number.isNaN(Number(actionId))) {
          const defer = this._defer;
          this._defer = null;
          await this.hide();
          if (defer !== null) defer.resolve(Number(actionId));
        }
      }
    });
  }

  async show(layout: UserAction[][]): Promise<number> {
    this._message = await this._transport.telegram.sendMessage(
      this._sessionId,
      this._defaultMessageText,
      { disable_notification: true, ...Markup.inlineKeyboard(this._transformButtons(layout)) },
    );

    return new Promise((resolve, reject) => {
      this._defer = { resolve, reject };
    });
  }

  async hide(): Promise<boolean> {
    if (this._message === null) return false;
    await this._transport.telegram.deleteMessage(this._message.chat.id, this._message.message_id);
    this._message = null;
    if (this._defer !== null) {
      this._defer.reject(new Error('UserActions hidden directly'));
      this._defer = null;
    }
    return true;
  }
}
