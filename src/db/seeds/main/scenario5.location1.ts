import path from 'path';

import { MapParser } from '@utils/LocationMapParser/MapParser';
import {
  AbstractEntity,
  InteractionEntity,
  MapSpotEntity,
  DataContainer,
  createDataCollection,
  DataCollection,
} from '@db/entities';

import { npc1Seed } from '@npcs/scenario-5/1/seed';
import { npc2Seed } from '@npcs/scenario-5/2/seed';
import { npc3Seed } from '@npcs/scenario-5/3/seed';
import { npc4Seed } from '@npcs/scenario-5/4/seed';
import { npc5Seed } from '@npcs/scenario-5/5/seed';
import { quest1Seed } from '@quests/scenario-5/1/seed';

import { ConnectorTo, ConnectorFrom } from '../Connector';

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

const getSpot = (
  [, spots]: [DataCollection['data'], Map<string, DataContainer<MapSpotEntity>>], x: number, y: number,
): { spot: DataContainer<MapSpotEntity> } => {
  const spot = spots.get(`${x}:${y}`);

  if (spot == null) throw new Error('Invalid position');

  return {
    spot,
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

  npc1Seed({
    baseInfo,
    dataCollection,
    ...getSpot([dataCollection.data, spots], 1, 10),
  });

  npc2Seed({
    baseInfo,
    dataCollection,
    ...getSpot([dataCollection.data, spots], 6, 14),
  });

  npc3Seed({
    baseInfo,
    dataCollection,
    ...getSpot([dataCollection.data, spots], 14, 8),
  });

  npc4Seed({
    baseInfo,
    dataCollection,
    ...getSpot([dataCollection.data, spots], 22, 2),
  });

  npc5Seed({
    baseInfo,
    dataCollection,
    ...getSpot([dataCollection.data, spots], 23, 13),
  });

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

  const quest1Spot = spots.get('4:1');

  if (quest1Spot == null) throw new Error('Invalid position');

  quest1Seed({ baseInfo, spot: quest1Spot, dataCollection });

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
