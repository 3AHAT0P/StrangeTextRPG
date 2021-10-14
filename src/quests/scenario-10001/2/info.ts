import { SmallHealingPotion } from '@actors/potions';
import { UniqueOldFamilyRingArmor } from '@actors/armor';
import type { QuestState, QuestId } from '@quests/@types';

export type Quest2State = 'PRE_INITIAL' | QuestState | 'PHASE_1' | 'PHASE_2';

export const Quest2States: Readonly<Record<Quest2State, Quest2State>> = <const>{
  PRE_INITIAL: 'PRE_INITIAL',
  INITIAL: 'INITIAL',
  FINISHED_GOOD: 'FINISHED_GOOD',
  FINISHED_BAD: 'FINISHED_BAD',
  PHASE_1: 'PHASE_1',
  PHASE_2: 'PHASE_2',
};

export const quest2Id: QuestId = 'Scenario:10001|Quest:2';

export const Quest1Phase1TakeItemClass = SmallHealingPotion;
export const Quest1Phase1GiveItemClass = UniqueOldFamilyRingArmor;
