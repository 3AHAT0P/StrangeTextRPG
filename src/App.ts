import { MainUIType } from 'ConfigProvider';
// import { Player } from '@actors/Player';
import { DBService } from '@db/DBService';
// import { Cursor } from '@db/Cursor';

import {
  AbstractUI, AbstractSessionUI,
  AdditionalSessionInfo,
} from '@ui/@types';
import {
  // TelegramBotUi, TelegramBotInlineUI,
  SocketUI,
} from '@ui';

// import { TelegramBotInlineUi } from '@ui/TelegramBotInlineUI';
import logger from '@utils/Logger';
// import { ScenarioFactoryOptions, ScenarioManager } from '@scenarios';

import { SessionState } from './SessionState';

export class App {
  private ui: AbstractUI | AbstractSessionUI;

  private sessionStateMap: Map<string, SessionState> = new Map<string, SessionState>();

  private dbService = new DBService();

  private async closeSession(sessionId: string, ui: AbstractSessionUI | AbstractUI) {
    const state = this.sessionStateMap.get(sessionId);
    if (state == null) return;

    await ui.closeSession(sessionId);
    state.status = 'DEAD';
    await Promise.all(state.persistActionsContainers.map((container) => container.delete()));
    this.sessionStateMap.delete(sessionId);
  }

  private async runSession(
    sessionId: string,
    ui: AbstractUI,
    additionalInfo: AdditionalSessionInfo,
  ): Promise<void> {
    try {
      // if (this.sessionStateMap.get(sessionId) != null) {
      //   await ui.sendToUser('У тебя уже начата игровая сессия. Если хочешь начать с начала нажми на кнопку "Finish", а затем "Start" в закрепленном сообщении');
      //   return;
      // }
      // const state: SessionState = {
      //   sessionId,
      //   additionalInfo,
      //   player: new Player(),
      //   finishSession: this.closeSession.bind(null, sessionId, ui),
      //   status: 'ALIVE',
      //   ui,
      //   persistActionsContainers: [],
      // };
      // this.sessionStateMap.set(sessionId, state);

      // const scenarioManager = new ScenarioManager();

      // const cursor = new Cursor(this.dbService);

      // const onChangeScenario = async (scenarioId: number) => {
      //   // eslint-disable-next-line @typescript-eslint/no-use-before-define
      //   const nextScenario = await scenarioManager.takeOrCreateScenario(scenarioId, scenarioFactoryOptions);
      //   nextScenario.run();
      // };

      // const scenarioFactoryOptions: ScenarioFactoryOptions = {
      //   cursor,
      //   state,
      //   callbacks: {
      //     onChangeScenario,
      //     onExit: state.finishSession,
      //   },
      // };

      // await onChangeScenario(0);
    } catch (error) {
      logger.error('App::runSession', error);
    }
  }

  private onExit(event: string | number) {
    void this.ui.onExit(Array.from(this.sessionStateMap.keys()), event.toString());
    void this.dbService.destructor();
  }

  constructor(type: MainUIType) {
    process.once('SIGINT', this.onExit.bind(this, 'SIGINT'));
    process.once('SIGTERM', this.onExit.bind(this, 'SIGTERM'));
    // process.once('beforeExit', this.onExit.bind(this));

    this.runSession = this.runSession.bind(this);
    this.closeSession = this.closeSession.bind(this);

    this.ui = new SocketUI();
    console.log('!!!!!!!!!!!');
    // if (type === 'TELEGRAM') this.ui = new TelegramBotUi();
    // else if (type === 'TELEGRAM_INLINE') this.ui = new TelegramBotInlineUi();
    // else this.ui = new NodeUI();
  }

  public init() {
    console.log('!!!!!!!!!!!2');
    this.ui.init(this.runSession, this.closeSession);
  }
}
