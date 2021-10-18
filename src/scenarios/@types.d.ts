import type { Player } from '@actors/Player';
import type { AbstractNPC, AbstractMerchant, NPCId } from '@npcs';
import type { AdditionalSessionInfo } from '@ui';
import type { AbstractQuest, QuestState, QuestId } from '@quests';

export interface BaseScenarioContext {
  additionalInfo: AdditionalSessionInfo;
  player: Player;
}

export interface ScenarioWithMerchantsContext {
  loadMerchantInfo: (merchantId: NPCId) => void;
  unloadCurrentMerchant: () => void;
  currentMerchant: AbstractMerchant | null;
}

export interface ScenarioWithNPCsContext {
  loadNPCInfo: (npcId: NPCId) => void;
  unloadCurrentNPCInfo: () => void;
  currentNPC: AbstractNPC | null;
}

export interface ScenarioWithQuestsContext {
  quests: Record<number, AbstractQuest>;
  getQuest: (questId: QuestId) => AbstractQuest<QuestState>;
}

export interface ScenarioWithBattlesContext {
  battles: Record<string, number>;
}

export interface ScenarioContext extends
  BaseScenarioContext, ScenarioWithMerchantsContext, ScenarioWithNPCsContext,
  ScenarioWithBattlesContext, ScenarioWithQuestsContext,
{ }
