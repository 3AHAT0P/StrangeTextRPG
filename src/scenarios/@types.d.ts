import type { Player } from '@actors/Player';
import type { AbstractNPC, AbstractMerchant, NPCId } from '@npcs';
import type { AdditionalSessionInfo } from '@ui';
import type { AbstractQuest, QuestState, QuestId } from '@quests';
import type { BattleDifficulty } from '@db/entities/Battle';

export interface BaseScenarioContext {
  additionalInfo: AdditionalSessionInfo;
  player: Player;
  currentStatus: 'ON_MAP' | 'BATTLE' | 'DEFAULT' | 'DIALOG' | 'TRADING';
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

export interface BattleInfo {
  id: string;
  immune: number;
  difficult: BattleDifficulty;
}

export interface ScenarioWithBattlesContext {
  battles: Record<string, BattleInfo | null | void>;
}

export interface ScenarioContext extends
  BaseScenarioContext, ScenarioWithMerchantsContext, ScenarioWithNPCsContext,
  ScenarioWithBattlesContext, ScenarioWithQuestsContext,
{ }
