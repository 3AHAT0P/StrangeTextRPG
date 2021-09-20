import path from 'path';

import { MapParser } from '@utils/LocationMapParser/MapParser';
import {
  AbstractEntity,
  InteractionEntity,
  NPCEntity,
  MapSpotEntity,
  DataContainer,
  createDataCollection,
  DataCollection,
} from '@db/entities';

import { ConnectorTo, ConnectorFrom } from '../Connector';

import { eventBuilder } from './events';
import { npcInteractionBuilder } from './npcs';

const parseMap = async (
  dataCollection: DataCollection,
  exitInteractionId: string,
  onDiedId: string,
): Promise<Map<string, DataContainer<MapSpotEntity>>> => {
  const mapPath = path.resolve(__dirname, '..', '..', '..', '..', 'assets', 'scenario5.location1.ruin.png');
  const mapParser = new MapParser(
    mapPath,
    {
      scenarioId: 5,
      locationId: 1,
    },
    {
      exitId: exitInteractionId,
      onPlayerDiedId: onDiedId,
    },
    dataCollection,
  );

  await mapParser.init();

  await mapParser.parse();

  await mapParser.destructor();

  return mapParser.spotMap;
};

export const baseInfo = <const>{
  scenarioId: 5,
  locationId: 1,
};

export interface SeedResult {
  data: Record<string, DataContainer<AbstractEntity>>,
  inboundOnStart: ConnectorFrom;
  outboundToReturn: ConnectorTo;
}

const getSpotAndRelatedMerchant = (
  [data, spots]: [DataCollection['data'], Map<string, DataContainer<MapSpotEntity>>], x: number, y: number,
): { spot: DataContainer<MapSpotEntity>, npc: DataContainer<NPCEntity> } => {
  const spot = spots.get(`${x}:${y}`);
  const npcLink = spot?.links.find((link) => link.subtype === 'TALK_TO_NPC');
  const npc = data[npcLink?.to ?? ''] as DataContainer<NPCEntity>;

  if (spot == null || npc == null) throw new Error('Invalid position');

  return {
    spot,
    npc,
  };
};

export const scenario5Location1SeedRun = async (): Promise<SeedResult> => {
  const dataCollection = createDataCollection();

  const intro = dataCollection.addContainer<InteractionEntity>('Interaction', {
    ...baseInfo,
    isStart: true,
    text: 'Привет {{get additionalInfo "playerName"}}.\n'
      + '{{actorType player declension="nominative" capitalised=true}} очнулся посреди руин.\n'
      + '{{actorType player declension="nominative" capitalised=true}} не знаешь кто ты, где ты, зачем ты и что вообще произошло.\n',
  });

  const onDied = dataCollection.addContainer<InteractionEntity>('Interaction', {
    ...baseInfo,
    text: 'К сожалению, ты умер.',
  });

  const exitInteraction = dataCollection.addContainer<InteractionEntity>('Interaction', {
    ...baseInfo,
    text: 'Ты вырался из этого лабиринта живым. Хе, могло быть и хуже.',
  });

  const standUp = dataCollection.addContainer<InteractionEntity>('Interaction', {
    ...baseInfo,
    text: '{{actorType player declension="nominative" capitalised=true}} аккуратно встаешь опираясь на стену. Все тело болит и сопротивляется.',
  });

  const spots = await parseMap(
    dataCollection,
    exitInteraction.entity.interactionId,
    onDied.entity.interactionId,
  );

  const startSpot = spots.get('3:3');

  if (startSpot == null) throw new Error('Invalid position');

  npcInteractionBuilder(
    'default', {
      baseInfo,
      dataCollection,
      ...getSpotAndRelatedMerchant([dataCollection.data, spots], 1, 10),
    },
  );

  npcInteractionBuilder(
    'default', {
      baseInfo,
      dataCollection,
      ...getSpotAndRelatedMerchant([dataCollection.data, spots], 6, 14),
    },
  );

  npcInteractionBuilder(
    'default', {
      baseInfo,
      dataCollection,
      ...getSpotAndRelatedMerchant([dataCollection.data, spots], 14, 8),
    },
  );

  npcInteractionBuilder(
    'default', {
      baseInfo,
      dataCollection,
      ...getSpotAndRelatedMerchant([dataCollection.data, spots], 22, 2),
    },
  );

  npcInteractionBuilder(
    'default', {
      baseInfo,
      dataCollection,
      ...getSpotAndRelatedMerchant([dataCollection.data, spots], 23, 13),
    },
  );

  dataCollection.addLink(intro, {
    ...baseInfo,
    to: standUp.entity.interactionId,
    text: 'Встать',
    type: 'CUSTOM',
    subtype: 'OTHER',
  });

  dataCollection.addLink(standUp, {
    ...baseInfo,
    to: startSpot.entity.interactionId,
    text: '',
    type: 'AUTO',
    subtype: 'OTHER',
  });

  const eventSpot = spots.get('4:1');

  if (eventSpot == null) throw new Error('Invalid position');

  eventBuilder(1, { baseInfo, spot: eventSpot, dataCollection });

  return <const>{
    data: dataCollection.data,
    inboundOnStart(connect: ConnectorTo) {
      connect(intro, 'Начать сценарий!');
    },
    outboundToReturn(returnInteraction: DataContainer<AbstractEntity>) {
      dataCollection.addLink(exitInteraction, {
        ...baseInfo,
        to: returnInteraction.entity.interactionId,
        text: 'Вернутся к выбору локаций',
        type: 'CUSTOM',
        subtype: 'OTHER',
      });
      dataCollection.addLink(onDied, {
        ...baseInfo,
        to: returnInteraction.entity.interactionId,
        text: 'Вернутся к выбору локаций',
        type: 'CUSTOM',
        subtype: 'OTHER',
      });
    },
  };
};
