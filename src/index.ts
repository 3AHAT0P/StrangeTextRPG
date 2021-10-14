import { Player } from '@actors/Player';
import { DBService } from '@db/DBService';
import { Cursor } from '@db/Cursor';
import { SimpleInteraction } from '@interactions/SimpleInteraction';
import {
  AbstractUI, AbstractSessionUI,
  AdditionalSessionInfo,
  NodeUI, TelegramBotUi,
} from '@ui';
import { TelegramBotInlineUi } from '@ui/TelegramBotInlineUI';
import logger from '@utils/Logger';
import { getConfig } from 'ConfigProvider';
import { ScenarioFactoryOptions, ScenarioManager } from '@scenarios';

import { SessionState } from './SessionState';

class App {
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
      if (this.sessionStateMap.get(sessionId) != null) {
        await ui.sendToUser('У тебя уже начата игровая сессия. Если хочешь начать с начала нажми на кнопку "Finish", а затем "Start" в закрепленном сообщении');
        return;
      }
      const state: SessionState = {
        sessionId,
        additionalInfo,
        player: new Player(),
        currentInteraction: new SimpleInteraction({ ui, message: 'Hi\n' }),
        finishSession: this.closeSession.bind(null, sessionId, ui),
        status: 'ALIVE',
        ui,
        persistActionsContainers: [],
        events: { 1: 0 },
        merchants: {},
        npcList: {},
      };
      this.sessionStateMap.set(sessionId, state);

      const scenarioManager = new ScenarioManager();

      const cursor = new Cursor(this.dbService);

      const onChangeScenario = async (scenarioId: number) => {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        const nextScenario = await scenarioManager.takeOrCreateScenario(scenarioId, scenarioFactoryOptions);
        nextScenario.run();
      };

      const scenarioFactoryOptions: ScenarioFactoryOptions = {
        cursor,
        state,
        callbacks: {
          onChangeScenario,
          onExit: state.finishSession,
        },
      };

      await onChangeScenario(0);
    } catch (error) {
      logger.error('App::runSession', error);
    }
  }

  private onExit(event: string | number) {
    void this.ui.onExit(Array.from(this.sessionStateMap.keys()), event.toString());
    void this.dbService.destructor();
  }

  constructor(type: 'NODE' | 'TELEGRAM' | 'TELEGRAM_INLINE') {
    process.once('SIGINT', this.onExit.bind(this, 'SIGINT'));
    process.once('SIGTERM', this.onExit.bind(this, 'SIGTERM'));
    // process.once('beforeExit', this.onExit.bind(this));

    this.runSession = this.runSession.bind(this);
    this.closeSession = this.closeSession.bind(this);

    if (type === 'TELEGRAM') this.ui = new TelegramBotUi();
    else if (type === 'TELEGRAM_INLINE') this.ui = new TelegramBotInlineUi();
    else this.ui = new NodeUI();
  }

  public init() {
    this.ui.init(this.runSession, this.closeSession);
  }
}

const config = getConfig();
const app = new App(config.MAIN_UI);
app.init();
