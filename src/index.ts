import { Player } from './actors/Player';
import { AbstractInteraction } from './interactions/AbstractInteraction';
import { buildFirstLocation, buildSecondLocation } from './interactions/scenario';
import { SimpleInteraction } from './interactions/SimpleInteraction';
import { SessionState } from './SessionState';
import { SessionUIProxy } from './ui/SessionUIProxy';
import { NodeUI } from './ui/NodeUI';
import { TelegramBotUi } from './ui/TelegramBotUI';
import { AbstractSessionUI } from './ui/AbstractSessionUI';

const treeTraversal = async (interaction: AbstractInteraction): Promise<void> => {
  const nextInteractions: AbstractInteraction = await interaction.activate();
  setTimeout(treeTraversal, 16, nextInteractions);
}

const globalState: Map<string, SessionState> = new Map();

const doHistoryForUser = async (sessionId: string, ui: AbstractSessionUI) => {
  console.log('doHistoryForUser');
  try {
    const currentSessionUI = new SessionUIProxy(ui, sessionId);
    const mainInteraction = new SimpleInteraction(currentSessionUI, { message: 'БЕРИ МЕЧ И РУБИ!\n' });
    mainInteraction
      .addAction('ВЗЯТЬ МЕЧ', mainInteraction)
      .addAction('ПОПЫТАТЬСЯ ОСМОТРЕТЬСЯ', mainInteraction);
    const state: SessionState = {
      player: new Player(),
      currentInteraction: mainInteraction,
    };
    globalState.set(sessionId, state);

    // const firstLocation = buildFirstLocation(ui, state, buildSecondLocation(ui, state));

    await treeTraversal(mainInteraction);
  } catch (error) {
    console.log(error);
  }
}

const main = async () => {
  // const ui = new NodeUI().init();
  const tui = new TelegramBotUi().init(doHistoryForUser);
}

main();
