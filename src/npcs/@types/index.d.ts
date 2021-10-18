import type {
  MapSpotEntity,
  DataContainer,
  DataCollection,
} from '@db/entities';

export interface NPCInteractBuilderOptions {
  dataCollection: DataCollection;
  spot: DataContainer<MapSpotEntity>;
  baseInfo: {
    readonly scenarioId: number;
    readonly locationId: number;
  };
}

export type NPCId = `${'Scenario'}:${number}|${string}`;

export type NPCSubtype = 'USUAL' | 'WITH_QUEST' | 'MERCHANT';

export interface NPCInfo {
  readonly id: NPCId;
  readonly subtype: NPCSubtype;
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
