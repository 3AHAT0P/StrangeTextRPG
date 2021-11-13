import { Telegraf, Markup, Context } from 'telegraf';
import { Update, Message, KeyboardButton } from 'telegraf/typings/core/types/typegram';

import { UserAction } from '../UserActSelectors/BaseUserActSelector';
import { UserActSelectorAbstractAdapter } from '../UserActSelectorAbstractAdapter';

// @TODO: Not Tested
export class UserActSelectorTelegramBotAdapter extends UserActSelectorAbstractAdapter {
  declare protected _transport: Telegraf<Context<Update>>;

  private _message: Message.TextMessage | null = null;

  private _defaultMessageText: string = '——————————————————————————';

  // eslint-disable-next-line class-methods-use-this
  private _transformButtons(layout: UserAction[][]): KeyboardButton[][] {
    return layout.map(
      (row) => row.map(
        (action) => `${action.id}) ${action.text}`,
      ),
    );
  }

  init() {
    this._transport.on('text', async (ctx) => {
      const sessionId = ctx.message.chat.id.toString();
      const actionId = Number(ctx.message.text.split(')')[0]);
      if (this._sessionId === sessionId && !Number.isNaN(actionId)) {
        const defer = this._defer;
        this._defer = null;
        await this.hide();
        if (defer !== null) defer.resolve(actionId);
      }
    });
  }

  async show(layout: UserAction[][]): Promise<number> {
    this._message = await this._transport.telegram.sendMessage(
      this._sessionId,
      this._defaultMessageText,
      { disable_notification: true, ...Markup.keyboard(this._transformButtons(layout)).resize() },
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
