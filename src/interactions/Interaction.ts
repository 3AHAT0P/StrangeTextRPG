import { AbstractUI, MessageType } from "../ui/AbstractUI";
import { AbstractInteraction } from "./AbstractInteraction";

export const isInteraction = (
  interaction: AbstractInteraction,
): interaction is Interaction => interaction instanceof Interaction;

export interface InteractionOptions {
  buildMessage?(): string;
  activate?(this: Interaction): Promise<AbstractInteraction[]>;
  messageType?: MessageType;
}

export class Interaction extends AbstractInteraction {
  protected _messageType: MessageType = 'default';

  protected _buildMessage: null | (() => string) = null;

  protected _activate: null | (() => Promise<AbstractInteraction[]>) = null;

  constructor(ui: AbstractUI, options: InteractionOptions = {}) {
    super(ui);
    if (options.buildMessage != null) this._buildMessage = options.buildMessage;
    if (options.activate != null) this._activate = options.activate;
    if (options.messageType != null) this._messageType = options.messageType;
  }

  public buildMessage(...args: any[]): string {
    if (this._buildMessage !== null) return this._buildMessage();
    
    throw new Error('Method not implemented');
  }

  public async activate(): Promise<AbstractInteraction[]> {
    if (this._activate !== null) return this._activate();

    return super.activate();
  }
}
