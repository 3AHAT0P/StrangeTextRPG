import { QuestState, QuestId } from '@quests/@types';

export type Quest1State = 'PRE_INITIAL' | QuestState;

export const Quest1States: Readonly<Record<Quest1State, Quest1State>> = <const>{
  PRE_INITIAL: 'PRE_INITIAL',
  INITIAL: 'INITIAL',
  FINISHED_GOOD: 'FINISHED_GOOD',
  FINISHED_BAD: 'FINISHED_BAD',
};

export const quest1Id: QuestId = 'Scenario:10001|Quest:1';
