import { Player } from '@actors/Player';
import { AbstractNPC } from '@actors/AbstractNPC';
import { AbstractMerchant } from '@actors/AbstractMerchant';
import { AdditionalSessionInfo } from '@ui';
import { ScenarioEvent } from '@utils/@types/ScenarioEvent';

export interface ScenarioContext {
  additionalInfo: AdditionalSessionInfo;
  player: Player;
  events: Record<number, ScenarioEvent>;
  battles: Record<string, number>;
  loadMerchantInfo: (merchantId: string) => void;
  currentMerchant: AbstractMerchant | null;
  loadNPCInfo: (npcId: string) => void;
  currentNPC: AbstractNPC | null;
}
