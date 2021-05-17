import { Player } from '@actors/Player';
import { AbstractInteraction } from '@interactions/AbstractInteraction';
import { SimpleInteraction } from '@interactions/SimpleInteraction';
import { buildZeroLocation } from '@scenarios';
import {
  AbstractUI, AbstractSessionUI, SessionUIProxy,
  AdditionalSessionInfo,
  NodeUI, TelegramBotUi,
} from '@ui';
import { DropSessionError } from '@utils/Error/DropSessionError';

import { SessionState } from './SessionState';

class App {
  private ui: AbstractUI | AbstractSessionUI;

  private sessionStateMap: Map<string, SessionState> = new Map<string, SessionState>();

  private async treeTraversal(state: SessionState): Promise<void> {
    try {
      const nextInteractions: AbstractInteraction | null = await state.currentInteraction.interact();
      if (nextInteractions == null || state.status === 'DEAD') return;

      // eslint-disable-next-line no-param-reassign
      state.currentInteraction = nextInteractions;
      setTimeout(this.treeTraversal, 16, state);
    } catch (error) {
      if (error instanceof DropSessionError) return;
      console.log(error);
      await state.ui.sendToUser('Извините, что-то поломалось.\nЕсли вы не входите в команду разработки, напишите пожалуйста автору.\nСпасибо за понимание ;-)\n');
    }
  }

  private async closeSession(sessionId: string, ui: AbstractSessionUI) {
    const state = this.sessionStateMap.get(sessionId);
    if (state == null) return;

    await ui.closeSession(sessionId);
    state.status = 'DEAD';
    this.sessionStateMap.delete(sessionId);
  }

  private async runSession(
    sessionId: string,
    ui: AbstractSessionUI,
    additionalInfo: AdditionalSessionInfo,
  ): Promise<void> {
    try {
      if (this.sessionStateMap.get(sessionId) != null) {
        await ui.sendToUser(
          sessionId,
          'У тебя уже начата игровая сессия. Если хочешь начать с начала нажми на кнопку "Finish", а затем "Start" в закрепленном сообщении',
        );
        return;
      }
      const currentSessionUI = new SessionUIProxy(ui, sessionId);
      const state: SessionState = {
        sessionId,
        additionalInfo,
        player: new Player(),
        currentInteraction: new SimpleInteraction({ ui: currentSessionUI, message: 'Hi\n' }),
        finishSession: this.closeSession.bind(null, sessionId, ui),
        status: 'ALIVE',
        ui: currentSessionUI,
      };
      this.sessionStateMap.set(sessionId, state);

      const zeroLocation = buildZeroLocation(currentSessionUI, state);
      state.currentInteraction = zeroLocation;

      await this.treeTraversal(state);
    } catch (error) {
      console.error(error);
    }
  }

  private async runSingleSession(
    sessionId: string,
    ui: AbstractUI,
    additionalInfo: AdditionalSessionInfo,
  ): Promise<void> {
    try {
      const state: SessionState = {
        sessionId,
        additionalInfo,
        player: new Player(),
        currentInteraction: new SimpleInteraction({ ui, message: 'Hi\n' }),
        finishSession() {
          process.exit(0);
        },
        status: 'ALIVE',
        ui,
      };
      this.sessionStateMap.set(sessionId, state);

      const zeroLocation = buildZeroLocation(ui, state);
      state.currentInteraction = zeroLocation;

      await this.treeTraversal(state);
    } catch (error) {
      console.error(error);
    }
  }

  private onExit(event: string | number) {
    void this.ui.onExit(Array.from(this.sessionStateMap.keys()), event.toString());
  }

  constructor(type: 'NODE' | 'TELEGRAM') {
    process.once('SIGINT', this.onExit.bind(this, 'SIGINT'));
    process.once('SIGTERM', this.onExit.bind(this, 'SIGTERM'));
    // process.once('beforeExit', this.onExit.bind(this));

    this.runSession = this.runSession.bind(this);
    this.closeSession = this.closeSession.bind(this);
    this.treeTraversal = this.treeTraversal.bind(this);

    if (type === 'TELEGRAM') this.ui = new TelegramBotUi().init(this.runSession, this.closeSession);
    else {
      this.ui = new NodeUI();
      void this.runSingleSession('1', this.ui, { playerName: 'Путник', playerId: '1' });
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const app = new App('TELEGRAM');
