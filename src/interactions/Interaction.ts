import { AbstractUI, MessageType } from "../ui/AbstractUI";
import { AbstractInteraction, AbstractInteractionOptions } from "./AbstractInteraction";

export const isInteraction = (
  interaction: AbstractInteraction,
): interaction is Interaction => interaction instanceof Interaction;

export interface InteractionOptions extends AbstractInteractionOptions {
  buildMessage?(): string;
  activate?(this: Interaction, message: string): Promise<AbstractInteraction | null | 'SUPER'>;
}

export class Interaction extends AbstractInteraction {
  protected _buildMessage: null | (() => string) = null;

  protected _activate: null | ((this: Interaction, message: string) => Promise<AbstractInteraction | null | 'SUPER'>) = null;

  constructor(options: InteractionOptions) {
    super(options);
    if (options.buildMessage != null) this._buildMessage = options.buildMessage;
    if (options.activate != null) this._activate = options.activate;
  }

  protected async beforeActivate(): Promise<string> {
    if (this._buildMessage !== null) return this._buildMessage();
    
    throw new Error('Method not implemented');
  }

  public async activate(message: string): Promise<string> {
    if (this._activate !== null) {
      const result = await this._activate(message);
      if (result instanceof AbstractInteraction) {
        this.addAction('__default__', result);
        return '__default__';
      } else if (result === 'SUPER') return super.activate(message);

      return 'null';
    }

    return super.activate(message);
  }
}
