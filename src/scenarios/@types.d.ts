import type { Player } from '@actors/Player';
import type { AbstractNPC } from '@actors/AbstractNPC';
import type { AbstractMerchant } from '@actors/AbstractMerchant';
import type { AdditionalSessionInfo } from '@ui';
import type { ScenarioEvent } from '@utils/@types/ScenarioEvent';
import type { AbstractEvent, EventState } from '@scenarios/utils/Event';

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
  events: Record<number, ScenarioEvent>;
  getEvent: (eventId: AbstractEvent<EventState>['_id']) => AbstractEvent<EventState>;
}

export interface ScenarioWithBattlesContext {
  battles: Record<string, number>;
}

export interface ScenarioContext extends
  BaseScenarioContext, ScenarioWithMerchantsContext, ScenarioWithNPCsContext,
  ScenarioWithEventsContext, ScenarioWithBattlesContext,
{ }
