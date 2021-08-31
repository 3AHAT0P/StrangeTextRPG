import 'reflect-metadata';
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
import { DIConsumer, DIFactory } from '@utils/DI';
import { scenarioManager } from '@scenarios';
import { ScenarioFactoryOptions } from '@scenarios/ScenarioManager';

import { SessionState } from './SessionState';

@DIConsumer
export class App {
  private ui: AbstractUI | AbstractSessionUI = new NodeUI();

  private sessionStateMap: Map<string, SessionState> = new Map<string, SessionState>();

  private async closeSession(sessionId: string, ui: AbstractSessionUI | AbstractUI) {
    const state = this.sessionStateMap.get(sessionId);
    if (state == null) return;

    await ui.closeSession(sessionId);
    state.status = 'DEAD';
    await Promise.all(state.persistActionsContainers.map((container) => container.delete()));
    this.sessionStateMap.delete(sessionId);
  }

  private _buildSessionState(sessionId: string, ui: AbstractUI, additionalInfo: AdditionalSessionInfo): SessionState {
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

    return state;
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

      const state = this._buildSessionState(sessionId, ui, additionalInfo);

      const cursor = DIFactory<typeof Cursor>(Cursor);

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
    void this._dbService.destructor();
  }

  constructor(private _dbService: DBService) {
    process.once('SIGINT', this.onExit.bind(this, 'SIGINT'));
    process.once('SIGTERM', this.onExit.bind(this, 'SIGTERM'));
    // process.once('beforeExit', this.onExit.bind(this));

    this.runSession = this.runSession.bind(this);
    this.closeSession = this.closeSession.bind(this);
  }

  public init(type: 'NODE' | 'TELEGRAM' | 'TELEGRAM_INLINE'): void {
    if (type === 'TELEGRAM') this.ui = new TelegramBotUi();
    else if (type === 'TELEGRAM_INLINE') this.ui = new TelegramBotInlineUi();

    this.ui.init(this.runSession, this.closeSession);
  }
}
