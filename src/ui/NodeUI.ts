import readline from 'readline';
import { MESSAGES } from '../translations/ru';

import { AbstractUI } from "./AbstractUI";

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

  public sendToUser(message: string): void {
    // this.internalInterface.write(outputMessage);
    this.output.cork();
    this.output.write(message);
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
  public waitInteraction(): Promise<number> {
    return new Promise((resolve, reject) => {
      this.internalInterface.prompt();
      this.internalInterface.once('line', (answer: string) => {
        const optionId = Number(answer);
        if (answer === '' || Number.isNaN(optionId)) reject('Answer is incorrect');
        resolve(optionId);
      });
    });
  }

  public interactWithUser(messages: string[], options?: string[]): Promise<number> {
    this.sendToUser(this.prepareMessage(messages, options));
    return this.waitInteraction();
  }
}
