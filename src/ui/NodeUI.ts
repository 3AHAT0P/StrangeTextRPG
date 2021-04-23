import readline from 'readline';
import { MESSAGES } from '../translations/ru';

import { AbstractUI, MessageType } from "./AbstractUI";

export enum TextModifiers {
  Reset = '\x1b[0m',
  Bright = '\x1b[1m', // Bold
  Dim = '\x1b[2m', // low lightness
  Italic = '\x1b[3m',
  Underscore = '\x1b[4m',
  Blink = '\x1b[5m',
  Reverse = '\x1b[7m',
  Hidden = '\x1b[8m',

  FgBlack = '\x1b[30m',
  FgRed = '\x1b[31m',
  FgGreen = '\x1b[32m',
  FgYellow = '\x1b[33m',
  FgBlue = '\x1b[34m',
  FgMagenta = '\x1b[35m',
  FgCyan = '\x1b[36m',
  FgWhite = '\x1b[37m',

  BgBlack = '\x1b[40m',
  BgRed = '\x1b[41m',
  BgGreen = '\x1b[42m',
  BgYellow = '\x1b[43m',
  BgBlue = '\x1b[44m',
  BgMagenta = '\x1b[45m',
  BgCyan = '\x1b[46m',
  BgWhite = '\x1b[47m',
}

export const MessageTypes: Record<MessageType, TextModifiers[]> = {
  default: [],
  damageDealt: [TextModifiers.FgGreen],
  damageTaken: [TextModifiers.FgRed],
  option: [TextModifiers.Italic],
  stats: [TextModifiers.Dim, TextModifiers.FgMagenta],
}

export class NodeUI extends AbstractUI {
  private input: NodeJS.ReadStream = process.stdin;
  private output: NodeJS.WriteStream = process.stdout;

  private internalInterface: readline.Interface = readline.createInterface({
    input: this.input,
    output: this.output,
    prompt: MESSAGES.prompt,
    terminal: false,
    tabSize: 2,
  });

  public sendToUser(message: string, type: MessageType): void {
    // this.internalInterface.write(outputMessage);
    this.output.cork();
    this.output.write(MessageTypes[type].join(''));
    this.output.write(message);
    this.output.write(TextModifiers.Reset);
    process.nextTick(() => this.output.uncork());
  }

  public prepareMessage(messages: string[], options?: string[]): string {
    let outputMessage = messages.join('');
    if (options != null && options.length > 0) {
      outputMessage += options.reduce(
        (acc: string, option: string, index: number) => `${acc} - ${index + 1}) ${option}`,
        '',
      );
    }
    return outputMessage;
  }

  /**
   * waitInteraction
   */
  public waitInteraction(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.internalInterface.prompt();
      this.internalInterface.once('line', (answer: string) => {
        const optionId = Number(answer);
        if (answer === '' || Number.isNaN(optionId)) reject('Answer is incorrect');
        resolve(optionId.toString());
        // TODO:
      });
    });
  }

  public interactWithUser(message: string, options: string[]): Promise<string> {
    this.sendToUser(message, 'default');
    if (options != null && options.length > 0) {
      options.forEach((option: string, index: number) => this.sendToUser(`${index + 1}) ${option}`, 'option'));
    }

    return this.waitInteraction();
  }
}
