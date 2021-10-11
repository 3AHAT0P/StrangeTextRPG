import type { Player } from '@actors/Player';
import type { AbstractNPC } from '@actors/AbstractNPC';
import type { AbstractMerchant } from '@actors/AbstractMerchant';
import type { AdditionalSessionInfo } from '@ui';
import type { AbstractEvent, EventState } from '@scenarios/utils/Event';
import type { AbstractQuest, QuestState } from '@scenarios/utils/Quest';

export interface BaseScenarioContext {
  additionalInfo: AdditionalSessionInfo;
  player: Player;
}

export interface ScenarioWithMerchantsContext {
  loadMerchantInfo: (merchantId: AbstractMerchant['_id']) => void;
  unloadCurrentMerchant: () => void;
  currentMerchant: AbstractMerchant | null;
}

export interface ScenarioWithNPCsContext {
  loadNPCInfo: (npcId: AbstractNPC['_id']) => void;
  unloadCurrentNPCInfo: () => void;
  currentNPC: AbstractNPC | null;
}

export interface ScenarioWithEventsContext {
  events: Record<number, AbstractEvent>;
  getEvent: (eventId: AbstractEvent<EventState>['_id']) => AbstractEvent<EventState>;
}

export interface ScenarioWithQuestsContext {
  quests: Record<number, AbstractQuest>;
  getQuest: (questId: AbstractQuest<QuestState>['_id']) => AbstractQuest<QuestState>;
}

export interface ScenarioWithBattlesContext {
  battles: Record<string, number>;
}

export interface ScenarioContext extends
  BaseScenarioContext, ScenarioWithMerchantsContext, ScenarioWithNPCsContext,
  ScenarioWithEventsContext, ScenarioWithBattlesContext, ScenarioWithQuestsContext,
{ }
