import readline from 'readline';

const MESSAGES = {
  prompt: 'Твои действия> ',
  title: 'БЕРИ МЕЧ И РУБИ!\n',
  actions: {
    takeSword: 'ВЗЯТЬ МЕЧ\n',
    attack: 'РУБИТЬ\n',
    lookAround: 'ПОПЫТАТЬСЯ ОСМОТРЕТЬСЯ\n',
    again: 'НАЧАТЬ ЗАНОВО\n',
    exit: 'ВСЕ! ХВАТИТ С МЕНЯ!\n',
  },
  afterTakeSword: 'Ладонь сжимает рукоять меча - шершавую и тёплую.\n',
  afterAttack: 'Воздух свистит, рассекаемый сталью, и расплывчатый силуэт перед тобой делает сальто назад.\n',
  afterLookAround: 'Серый песок, фиолетовое небо, и расплывчатый клинок, торчащий из твоей грудины.\nВремени не было уже секунду назад; сейчас последние секунды с кровью утекают в песок.\nВы проиграли\n',
};

class GameTreeNode {
  public message: string;

  public actions: Map<string, GameTreeNode>;

  constructor(message: string, actions?: Array<[string, GameTreeNode]>) {
    this.message = message;
    this.actions = new Map();
    if (actions != null) {
      for (const [message, child] of actions) {
        this.actions.set(message, child);
      }
    }
  }

  public addAction(message: string, nextNode: GameTreeNode): this {
    this.actions.set(message, nextNode);
    return this;
  }
}

const mainInteraction = new GameTreeNode('БЕРИ МЕЧ И РУБИ!\n');
const takeSwordInteraction = new GameTreeNode('Ладонь сжимает рукоять меча - шершавую и тёплую.\n');
const attackInteraction = new GameTreeNode('Воздух свистит, рассекаемый сталью, и расплывчатый силуэт перед тобой делает сальто назад.\n');

const lookAroundInteraction = new GameTreeNode(
  'Серый песок, фиолетовое небо, и расплывчатый клинок, торчащий из твоей грудины.\n'
  + 'Времени не было уже секунду назад; сейчас последние секунды с кровью утекают в песок.\n'
  + 'Вы проиграли\n',
);

const exitInteraction = new GameTreeNode('Удачи!');

mainInteraction
  .addAction('ВЗЯТЬ МЕЧ\n', takeSwordInteraction)
  .addAction('ПОПЫТАТЬСЯ ОСМОТРЕТЬСЯ\n', lookAroundInteraction);

takeSwordInteraction
  .addAction('РУБИТЬ\n', attackInteraction)
  .addAction('ПОПЫТАТЬСЯ ОСМОТРЕТЬСЯ\n', lookAroundInteraction);

lookAroundInteraction
  .addAction('НАЧАТЬ ЗАНОВО\n', mainInteraction)
  .addAction('ВСЕ! ХВАТИТ С МЕНЯ!\n', exitInteraction);

abstract class AbstractUI {
  public abstract interactWithUser(messages: string[], options?: string[]): Promise<number>;
}

class NodeUI extends AbstractUI {
  private input: NodeJS.ReadStream = process.stdin;
  private output: NodeJS.WriteStream = process.stdout;

  private internalInterface: readline.Interface = readline.createInterface({
    input: this.input,
    output: this.output,
    prompt: MESSAGES.prompt,
    terminal: false,
    tabSize: 2,
  });

  private sendToUser(message: string): void {
    this.output.cork();
    this.output.write(message);
    process.nextTick(() => this.output.uncork());
  }

  public interactWithUser(messages: string[], options?: string[]): Promise<number> {
    let outputMessage = messages.join('');
    if (options != null && options.length > 0) {
      outputMessage += options.reduce((acc: string, option: string, index: number) => {
        return `${acc} - ${index + 1}) ${option}`;
      }, '');
    }
    return new Promise((resolve, reject) => {
      // this.internalInterface.write(outputMessage);
      this.sendToUser(outputMessage);
      this.internalInterface.prompt();
      this.internalInterface.once('line', (answer: string) => {
        const optionId = Number(answer);
        if (Number.isNaN(optionId)) reject('Answer is incorrect');
        resolve(optionId);
      });
    });
  }
}

const main = async () => {
  const ui = new NodeUI();
  let userChoise: number;
  while (true) {
    userChoise = await ui.interactWithUser([MESSAGES.title], [MESSAGES.actions.takeSword, MESSAGES.actions.lookAround]);
    if (userChoise === 1) {
      userChoise = await ui.interactWithUser(
        [MESSAGES.afterTakeSword],
        [MESSAGES.actions.attack, MESSAGES.actions.lookAround],
      );
      if (userChoise === 1) {
        userChoise = await ui.interactWithUser(
          [MESSAGES.afterAttack],
        );
      } else if (userChoise === 2) {
        userChoise = await ui.interactWithUser(
          [MESSAGES.afterLookAround],
          [MESSAGES.actions.again, MESSAGES.actions.exit],
        );
        if (userChoise === 2) break;
      }
    } else if (userChoise === 2) {
      userChoise = await ui.interactWithUser(
        [MESSAGES.afterLookAround],
        [MESSAGES.actions.again, MESSAGES.actions.exit],
      );
      if (userChoise === 2) break;
    }
  }
}

main();

// rl.prompt();

// rl.on('line', (line: string) => {
//   switch (line.trim()) {
//     case 'hello':
//       console.log('world!');
//       break;
//     default:
//       console.log(`Say what? I might have heard '${line.trim()}'`);
//       break;
//   }
//   rl.prompt();
// }).on('close', () => {
//   console.log('Have a great day!');
//   process.exit(0);
// });





/*
БЕРИ МЕЧ И РУБИ!

> ВЗЯТЬ МЕЧ

Ладонь сжимает рукоять меча - шершавую и тёплую. Воздух свистит, рассекаемый сталью, и расплывчатый силуэт перед тобой делает сальто назад.

> ПОПЫТАТЬСЯ ОСМОТРЕТЬСЯ

Серый песок, фиолетовое небо, и расплывчатый клинок, торчащий из твоей грудины. Времени не было уже секунду назад; сейчас последние секунды с кровью утекают в песок.
Вы проиграли.
> НАЧАТЬ ЗАНОВО
*/