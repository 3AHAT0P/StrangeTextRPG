import { SmallHealingPotion } from '@actors/potions';
import { AbstractMerchant } from '@actors/AbstractMerchant';
import { Rat } from '@actors/bestiary/Rat';
import {
  BattleModel, InteractionModel, MapSpotModel, OneOFNodeModel,
} from '@db/entities';
import { ActionModel } from '@db/entities/Action';
import { BattleDifficulty } from '@db/entities/Battle';
import { MapSpotSubtype } from '@db/entities/MapSpot';
import { ActionsLayout } from '@ui';
import { Template } from '@utils/Template';
import logger from '@utils/Logger';
import { Matcher } from '@utils/Matcher';
import { getRandomIntInclusive } from '@utils/getRandomIntInclusive';
import { descriptions } from '@locations/LocationDescriptions';
import { AbstractEvent, EventState } from '@scenarios/utils/Event';

import {
  AbstractScenario, findActionBySubtype, interactWithBattle, processActions,
} from '../AbstractScenario';

import { ScenarioContext } from '../@types';

import { NPCManager } from './npcs';
import { EventManager } from './events';

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

export class ScenarioNo5Test extends AbstractScenario {
  protected _scenarioId: number = 10001;

  protected _context: ScenarioContext | null = null;

  protected get context(): ScenarioContext {
    if (this._context == null) throw new Error('context is null');
    return this._context;
  }

  protected currentSpot: MapSpotModel | null = null;

  protected previousSpot: MapSpotModel | null = null;

  protected npcManager: NPCManager = new NPCManager();

  protected _eventManager: EventManager | null = null;

  protected get eventManager(): EventManager {
    if (this._eventManager == null) throw new Error('eventManager is null');
    return this._eventManager;
  }

  protected async _runner(): Promise<void> {
    if (this.context === null) throw new Error('Context is null');

    try {
      if (this.currentNode instanceof InteractionModel) {
        await this._sendTemplateToUser(this.currentNode.text, this.context);
      }

      if (this.currentNode instanceof BattleModel) {
        const goldReward = getGoldCount(this.currentNode.difficult);
        this.currentNode = await interactWithBattle(
          this._state.ui,
          this._cursor,
          this._state.player,
          [new Rat()],
          this.previousSpot,
        );
        this._state.player.inventory.collectGold(goldReward);
        console.log(this._state.player.inventory);
        return;
      }

      const processedActions = processActions(await this._cursor.getActions(), this.context);

      if (processedActions.auto != null) {
        processedActions.auto.operation?.useContext(this.context)?.forceBuild();
        this.currentNode = await this._cursor.getNextNode(processedActions.auto);
        return;
      }

      if (processedActions.system.length > 0) {
        const onDealSuccessAction = findActionBySubtype(processedActions.system, 'DEAL_SUCCESS');
        const onDealFailureAction = findActionBySubtype(processedActions.system, 'DEAL_FAILURE');
        if (onDealSuccessAction !== null && onDealFailureAction !== null) {
          this.currentNode = await this._buyOrLeaveInteract(
            onDealSuccessAction, onDealFailureAction, processedActions.custom,
          );
          return;
        }
        throw new Error('Unprocessed system actions found');
      }

      const choosedAction = await this._interactWithUser(processedActions.custom, this.context);

      if (choosedAction.subtype === 'MOVE_FORBIDDEN') return;

      if (['MOVE_TO_WEST', 'MOVE_TO_EAST', 'MOVE_TO_NORTH', 'MOVE_TO_SOUTH'].includes(choosedAction.subtype)) {
        await this._sendTransitionMessage(choosedAction);
      }

      this.currentNode = await this._cursor.getNextNode(choosedAction);

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

  private async _buyOrLeaveInteract(
    onDealSuccessAction: ActionModel,
    onDealFailureAction: ActionModel,
    otherActions: ActionModel[],
  ): Promise<OneOFNodeModel> {
    const merchant = this.context?.currentMerchant;

    if (merchant == null) throw new Error('Merchant is null');

    const goodArray = merchant.showcase;

    const actionText = await this._state.ui.interactWithUser(
      new ActionsLayout()
        .addRow(...goodArray.map(({ name }) => `Купить ${name}`))
        .addRow(...otherActions.map(({ text }) => text.useContext(this.context).value)),
    );

    const choosedGood = goodArray.find(({ name }) => `Купить ${name}` === actionText) ?? null;

    if (choosedGood === null) {
      const choosedAction = otherActions.find(({ text }) => text.isEqualTo(actionText));
      if (choosedAction == null) throw new Error('choosedGood and choosedAction is undefined');

      if (choosedAction.isPrintable) await this._sendTemplateToUser(choosedAction.text, this.context);

      return await this._cursor.getNextNode(choosedAction);
    }

    const playerExchangeResult = this._state
      .player.exchangeGoldToItem(choosedGood.price, [choosedGood]);

    if (!playerExchangeResult) return await this._cursor.getNextNode(onDealFailureAction);

    const merchantExchangeResult = merchant.exchangeItemToGold(choosedGood.price, choosedGood);
    if (!merchantExchangeResult) {
      this._state.player.exchangeItemToGold(choosedGood.price, choosedGood);
      return await this._cursor.getNextNode(onDealFailureAction);
    }

    await this._sendTemplateToUser(
      new Template(
        `⚙️ {{actorType player declension="nominative" capitalised=true}} купил ${choosedGood.name} x1.\n`
        + `Всего в инвентаре ${choosedGood.name} ${this._state.player.inventory.getItemsByClass(SmallHealingPotion).length}`,
      ),
      this.context,
    );
    return await this._cursor.getNextNode(onDealSuccessAction);
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
    await super.init();

    this._eventManager = new EventManager({ player: this._state.player });

    this._context = {
      additionalInfo: this._state.additionalInfo,
      player: this._state.player,
      events: {},
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
      currentNPC: null,
      getEvent: (eventId: string): AbstractEvent<EventState> => this.eventManager.get(eventId),
    };
  }
}
