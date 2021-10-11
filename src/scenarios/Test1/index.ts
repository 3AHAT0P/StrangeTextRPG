import { AbstractMerchant } from '@actors/AbstractMerchant';
import { Rat } from '@actors/bestiary/Rat';
import {
  BattleModel, InteractionModel, MapSpotModel,
} from '@db/entities';
import { ActionModel } from '@db/entities/Action';
import { BattleDifficulty } from '@db/entities/Battle';
import { MapSpotSubtype } from '@db/entities/MapSpot';
import logger from '@utils/Logger';
import { Matcher } from '@utils/Matcher';
import { getRandomIntInclusive } from '@utils/getRandomIntInclusive';
import { descriptions } from '@locations/LocationDescriptions';
import { AbstractEvent, EventState } from '@scenarios/utils/Event';

import { buyOrLeaveInteract } from '@scenarios/utils/buyOrLeaveInteract';
import { findActionBySubtype } from '@scenarios/utils/findActionBySubtype';
import { interactWithBattle } from '@scenarios/utils/interactWithBattle';
import { processActions } from '@scenarios/utils/processActions';

import { AbstractScenario } from '../AbstractScenario';
import { ScenarioContext } from '../@types';

import { NPCManager } from './npcs';
import { EventManager } from './events';
import { QuestManager } from './quests';
import { AbstractQuest, QuestState } from '@scenarios/utils/Quest';

const getGoldCount = (difficult: BattleDifficulty): number => {
  if (difficult === 'VERY_EASY') return 8;
  if (difficult === 'EASY') return 12;
  if (difficult === 'MEDIUM') return 16;
  if (difficult === 'HARD') return 21;
  if (difficult === 'VERY_HARD') return 26;
  return 0;
};

export type AmbiancesType = {
  walls: number;
  enemies: number;
  breaks: number;
  npc: number;
};

export class ScenarioNo5Test extends AbstractScenario<ScenarioContext> {
  protected _scenarioId: number = 10001;

  protected currentSpot: MapSpotModel | null = null;

  protected previousSpot: MapSpotModel | null = null;

  protected npcManager: NPCManager = new NPCManager();

  protected _eventManager: EventManager | null = null;

  protected get eventManager(): EventManager {
    if (this._eventManager == null) throw new Error('eventManager is null');
    return this._eventManager;
  }

  protected _questManager: QuestManager | null = null;

  protected get questManager(): QuestManager {
    if (this._questManager == null) throw new Error('questManager is null');
    return this._questManager;
  }

  protected _buildContext(): ScenarioContext {
    return {
      additionalInfo: this._state.additionalInfo,
      player: this._state.player,
      battles: {},
      loadMerchantInfo: (merchantId: string): void => {
        const npc = this.npcManager.get(merchantId);
        if (npc instanceof AbstractMerchant) {
          this.context.currentMerchant = npc;
        } else throw new Error(`NPC with id (${merchantId}) isn't merchant`);
      },
      unloadCurrentMerchant: (): void => {
        this.context.currentMerchant = null;
      },
      currentMerchant: null,
      loadNPCInfo: (npcId: string): void => {
        this.context.currentNPC = this.npcManager.get(npcId);
      },
      unloadCurrentNPCInfo: (): void => {
        this.context.currentNPC = null;
      },
      currentNPC: null,
      events: {},
      getEvent: (eventId: string): AbstractEvent<EventState> => this.eventManager.get(eventId),
      quests: {},
      getQuest: (questId: string): AbstractQuest<QuestState> => this.questManager.get(questId),
    };
  }

  protected async _runner(): Promise<void> {
    try {
      if (this.currentNode instanceof InteractionModel) {
        await this._sendTemplateToUser(this.currentNode.text, this.context);
      }

      if (this.currentNode instanceof BattleModel) {
        const action = await interactWithBattle(
          this._state.ui,
          this._cursor,
          this._state.player,
          [new Rat()],
          true,
        );
        if (action === null) {
          this.currentSpot = this.previousSpot;
          return;
        }

        this._state.player.inventory.collectGold(getGoldCount(this.currentNode.difficult));
        await this._updateCurrentNode(action, this.context);
        console.log(this._state.player.inventory);
        return;
      }

      const processedActions = processActions(await this._cursor.getActions(), this.context);

      if (processedActions.auto != null) {
        await this._updateCurrentNode(processedActions.auto, this.context);
        return;
      }

      if (processedActions.system.length > 0) {
        const onDealSuccessAction = findActionBySubtype(processedActions.system, 'DEAL_SUCCESS');
        const onDealFailureAction = findActionBySubtype(processedActions.system, 'DEAL_FAILURE');
        if (onDealSuccessAction !== null && onDealFailureAction !== null) {
          const action = await buyOrLeaveInteract(
            this.context, this._state.ui,
            onDealSuccessAction, onDealFailureAction, processedActions.custom,
          );

          await this._updateCurrentNode(action, this.context);
          return;
        }
        throw new Error('Unprocessed system actions found');
      }

      const choosedAction = await this._interactWithUser(processedActions.custom, this.context);

      if (choosedAction.subtype === 'MOVE_FORBIDDEN') return;

      if (['MOVE_TO_WEST', 'MOVE_TO_EAST', 'MOVE_TO_NORTH', 'MOVE_TO_SOUTH'].includes(choosedAction.subtype)) {
        await this._sendTransitionMessage(choosedAction);
      }

      await this._updateCurrentNode(choosedAction, this.context);

      if (
        ['MOVE_TO_WEST', 'MOVE_TO_EAST', 'MOVE_TO_NORTH', 'MOVE_TO_SOUTH'].includes(choosedAction.subtype)
        && this.currentNode instanceof MapSpotModel
      ) {
        this.previousSpot = this.currentSpot;
        this.currentSpot = this.currentNode;
        await this._onAfterChangeMapSpot(this.currentSpot);
      }
    } catch (error) {
      logger.error('ScenarioNo5Test::_runner', error);
      console.log(error);
    }
  }

  private async _sendTransitionMessage(action: ActionModel): Promise<void> {
    if (action.subtype === 'MOVE_TO_NORTH') await this._state.ui.sendToUser('Ты идешь на север');
    if (action.subtype === 'MOVE_TO_SOUTH') await this._state.ui.sendToUser('Ты идешь на юг');
    if (action.subtype === 'MOVE_TO_WEST') await this._state.ui.sendToUser('Ты идешь на запад');
    if (action.subtype === 'MOVE_TO_EAST') await this._state.ui.sendToUser('Ты идешь на восток');
  }

  private async _onAfterChangeMapSpot(mapSpot: MapSpotModel): Promise<void> {
    const spotsAround = (
      await this._cursor.getSpotsAround(mapSpot)
    )
      // eslint-disable-next-line no-nested-ternary
      .sort((a, b) => (a.y > b.y ? 1 : (a.y < b.y ? -1 : 0)));
    await this._sendAroundSpots(mapSpot, spotsAround);
    await this._sendAroundAmbiences(spotsAround);
  }

  private async _sendAroundSpots(mapSpot:MapSpotModel, spotsAround: MapSpotModel[]): Promise<void> {
    const subtypeIconMatcher: Record<string, string> = {
      UNREACHABLE: '⬛️',
      WALL: '🟫',
      BREAK: '🟪',
      EMPTY: '⬜️',
      MERCHANT: '🔵',
      LOCATION_EXIT: '🟥',
      default: '❔',
    };

    const mapPiece = [
      '',
      '',
      '',
    ];

    for (const spot of spotsAround) {
      if (spot.y === mapSpot.y && spot.x === mapSpot.x) mapPiece[1 + spot.y - mapSpot.y] += '🔹';
      else {
        mapPiece[1 + spot.y - mapSpot.y] += subtypeIconMatcher[spot.subtype] ?? subtypeIconMatcher.default;
      }
    }

    await this._state.ui.sendToUser(mapPiece.join('\n'));
  }

  public async _sendAroundAmbiences(spotsAround: MapSpotModel[]): Promise<void> {
    const ambiences = {
      walls: 0,
      enemies: 0,
      breaks: 0,
      npc: 0,
    };

    const mapSpotSubtypeMatcher = new Matcher<MapSpotSubtype, 'BATTLE' | 'ANY_NPC', typeof ambiences>();
    mapSpotSubtypeMatcher.addMatcher((event) => (event.startsWith('BATTLE#') ? 'BATTLE' : null));
    mapSpotSubtypeMatcher.addMatcher((event) => (['MERCHANT', 'NPC', 'QUEST_NPC'].includes(event) ? 'ANY_NPC' : null));

    mapSpotSubtypeMatcher
      // eslint-disable-next-line no-param-reassign
      .on('BATTLE', (result) => { result.enemies += 1; })
      // eslint-disable-next-line no-param-reassign
      .on('BREAK', (result) => { result.breaks += 1; })
      // eslint-disable-next-line no-param-reassign
      .on('WALL', (result) => { result.walls += 1; })
      // eslint-disable-next-line no-param-reassign
      .on('ANY_NPC', (result) => { result.npc += 1; });
    for (const spot of spotsAround) {
      // eslint-disable-next-line no-await-in-loop
      await mapSpotSubtypeMatcher.run(spot.subtype, ambiences);
    }

    const ambientDescriptions = (Object.keys(ambiences) as Array<keyof typeof ambiences>)
      .reduce<string[]>((acc, key) => (ambiences[key] > 0 ? [...acc, ...descriptions[key]] : acc), []);
    ambientDescriptions.push(...descriptions.default);
    await this._state.ui.sendToUser(
      ambientDescriptions[getRandomIntInclusive(0, ambientDescriptions.length - 1)],
      true,
    );
  }

  private async _printFAQ(): Promise<void> {
    await this._state.ui.sendToUser(''
      + '*** Общее ***\n'
      + '💬 [кто говорит]: - диалоговая фраза\n'
      + '⚙️ {...} - системные сообщения\n'
      + '📀 - Золото\n'
      + '💿 - Серебро\n'
      + '\n*** Карта ***\n'
      + '⬛️ - недостижимое место\n'
      + '🟫 - wall, стена, нет прохода\n'
      + '🟪 - break, обрыв, нет прохода\n'
      + '⬜️ - чистое место\n'
      + '🔵 - merchant, торговец\n'
      + '🔹 - player, игрок\n'
      + '🟥 - out, выход\n'
      + '🔸 - gold, золото\n'
      + '❔ - не разведанная территория\n'
      + '⬆️ - N (Север)\n'
      + '➡️ - E (Восток)\n'
      + '⬇️ - S (Юг)\n'
      + '⬅️ - W (Запад)\n');
  }

  public async init(): Promise<void> {
    this._eventManager = new EventManager({ player: this._state.player });

    await super.init();
  }
}
