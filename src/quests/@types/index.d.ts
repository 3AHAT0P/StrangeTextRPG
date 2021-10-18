import {
  MapSpotEntity,
  DataCollection,
  DataContainer,
} from '@db/entities';
import type { AbstractNPCManager } from '@npcs/AbstractNPCManager';

import type { Player } from '@actors';

export interface QuestBuilderOptions {
  dataCollection: DataCollection;
  spot: DataContainer<MapSpotEntity>;
  baseInfo: {
    readonly scenarioId: number;
    readonly locationId: number;
  };
}

export type QuestId = `${'Scenario'}:${number}|${string}`;

export type QuestState = 'INITIAL' | 'FINISHED_GOOD' | 'FINISHED_BAD';

export interface QuestOptions {
  player: Player;
  npcManager: AbstractNPCManager;
}

export interface NPCInfo {
  readonly id: QuestId;
  readonly state: QuestState;
  readonly name: string;
  readonly declensionOfNouns: {
    readonly nominative: string;
    readonly genitive: string;
    readonly dative: string;
    readonly accusative: string;
    readonly ablative: string;
    readonly prepositional: string;
    readonly possessive: string;
  };
}
