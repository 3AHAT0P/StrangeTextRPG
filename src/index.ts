import { Player } from './actors/Player';
import { AbstractInteraction } from './interactions/AbstractInteraction';
import { buildFirstLocation, buildSecondLocation, buildThirdLocation, buildZeroLocation } from './interactions/scenario';
import { SimpleInteraction } from './interactions/SimpleInteraction';
import { SessionState } from './SessionState';
import { SessionUIProxy } from './ui/SessionUIProxy';
import { NodeUI } from './ui/NodeUI';
import { AdditionalSessionInfo, TelegramBotUi } from './ui/TelegramBotUI';
import { AbstractSessionUI } from './ui/AbstractSessionUI';
import { AbstractUI } from './ui/AbstractUI';

class App {
  private ui: AbstractUI | AbstractSessionUI;
  private sessionStateMap: Map<string, SessionState> = new Map();

  private async treeTraversal(state: SessionState): Promise<void> {
    const nextInteractions: AbstractInteraction | null = await state.currentInteraction.activate();
    if (nextInteractions == null) return;

    state.currentInteraction = nextInteractions;
    setTimeout(this.treeTraversal, 16, state);
  }

  private async runSession(
    sessionId: string,
    ui: AbstractSessionUI,
    additionalInfo: AdditionalSessionInfo,
  ): Promise<void> {
    try {
      const currentSessionUI = new SessionUIProxy(ui, sessionId);
      const state: SessionState = {
        sessionId,
        additionalInfo,
        player: new Player(),
        currentInteraction: new SimpleInteraction(currentSessionUI, { message: 'Hi\n' }),
        finishSession: async () => {
          await ui.closeSession(sessionId);
          this.sessionStateMap.delete(sessionId);
        }
      };
      this.sessionStateMap.set(sessionId, state);

      // const firstLocation = buildFirstLocation(
      //   currentSessionUI,
      //   state,
      //   {
      //     actionMessage: 'Перейти к демо локации #2',
      //     interaction: buildSecondLocation(
      //       currentSessionUI, state, {
      //         actionMessage: 'Перейти к демо локации #3',
      //         interaction: buildThirdLocation(currentSessionUI, state),
      //       }),
      //   },
      // );

      const zeroLocation = buildZeroLocation(currentSessionUI, state);
      state.currentInteraction = zeroLocation;
      // const thirdLocation = buildThirdLocation(currentSessionUI, state);
      // state.currentInteraction = thirdLocation;
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
        currentInteraction: new SimpleInteraction(ui, { message: 'Hi\n' }),
        finishSession() {
          process.exit(0);
        }
      };
      this.sessionStateMap.set(sessionId, state);

      const firstLocation = buildFirstLocation(
        ui,
        state,
        { actionMessage: 'Перейти к демо локации #2', interaction: buildSecondLocation(ui, state)},
      );
      state.currentInteraction = firstLocation;
      await this.treeTraversal(state);
    } catch (error) {
      console.error(error);
    }
  }

  private onExit(event: string | number) {
    this.ui.onExit(Array.from(this.sessionStateMap.keys()), event.toString());
  }

  constructor(type: 'NODE' | 'TELEGRAM') {
    process.once('SIGINT', this.onExit.bind(this, 'SIGINT'));
    process.once('SIGTERM', this.onExit.bind(this, 'SIGTERM'));
    // process.once('beforeExit', this.onExit.bind(this));

    this.runSession = this.runSession.bind(this);
    this.treeTraversal = this.treeTraversal.bind(this);

    if (type === 'TELEGRAM') this.ui = new TelegramBotUi().init(this.runSession);
    else {
      this.ui = new NodeUI();
      this.runSingleSession('1', this.ui, { playerName: 'Путник', playerId: '1' });
    }
  }
}

const app = new App('TELEGRAM');
