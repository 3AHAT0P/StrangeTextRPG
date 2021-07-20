import path from 'path';

import { DBService, RepositoriesHash } from '@db/DBService';
import { AbstractModel } from '@db/entities/Abstract';
import { MapParser } from '@utils/LocationMapParser/MapParser';
import { InteractionModel, MapSpotModel, NPCModel } from '@db/entities';
import { ActionModel } from '@db/entities/Action';

import { ConnectorTo, ConnectorFrom } from '../Connector';

import { eventBuilder } from './events';
import { npcInteractionBuilder } from './npcs';

const parseMap = async (exitInteraction: InteractionModel, onDied: InteractionModel) => {
  const mapPath = path.resolve(__dirname, '..', '..', '..', '..', 'assets', 'test.location.png');
  const mapParser = new MapParser(
    mapPath,
    {
      scenarioId: 10001,
      locationId: 1,
    },
    {
      exit: exitInteraction,
      onPlayerDied: onDied,
    },
  );

  await mapParser.init();

  await mapParser.parse();

  await mapParser.destructor();
};

export const baseInfo = <const>{
  scenarioId: 10001,
  locationId: 1,
};

export interface Scenario5Location1Connectors {
  inboundOnStart: ConnectorFrom;
  outboundToReturn: ConnectorTo;
}

const getMerchantOnTheSpotQuery = 'MATCH (a: MapSpot)-[r: Action]->(b: NPC) WHERE a.x = $x AND a.y = $y RETURN a, b';

const getSpotAndRelatedMerchant = async (
  dbService: DBService, x: number, y: number,
): Promise<{ spot: MapSpotModel, npc: NPCModel }> => {
  const records = await dbService.runRawQuery(getMerchantOnTheSpotQuery, { x, y });
  const spotData = records[0].get(0);
  const merchantData = records[0].get(1);

  const mapSpot = dbService.repositories.mapSpotRepo.fromRecord(spotData);
  const merchant = dbService.repositories.npcRepo.fromRecord(merchantData);

  return { spot: mapSpot, npc: merchant };
};

const getActionsToSpot = async (
  dbService: DBService, x: number, y: number,
): Promise<ActionModel[]> => {
  const records = await dbService.runRawQuery('MATCH (a)-[r: Action]->(b: MapSpot) WHERE b.x = $x AND b.y = $y RETURN r', { x, y });
  return records.map((item) => dbService.repositories.actionRepo.fromRecord(item.get(0)));
};

export const scenarioTestLocation1SeedRun = async (dbService: DBService): Promise<Scenario5Location1Connectors> => {
  const {
    battleRepo, interactionRepo, npcRepo, mapSpotRepo, actionRepo,
  } = dbService.repositories;

  const intro = await interactionRepo.create({
    ...baseInfo,
    interactionId: 1,
    text: 'Привет {{get additionalInfo "playerName"}}.\n'
      + '{{actorType player declension="nominative" capitalised=true}} очнулся посреди руин.\n'
      + '{{actorType player declension="nominative" capitalised=true}} не знаешь кто ты, где ты, зачем ты и что вообще произошло.\n',
  });

  const onDied = await interactionRepo.create({
    ...baseInfo,
    interactionId: 9001,
    text: 'К сожалению, ты умер.',
  });

  const exitInteraction = await interactionRepo.create({
    ...baseInfo,
    interactionId: 9000,
    text: 'Ты вырался из этого лабиринта живым. Хе, могло быть и хуже.',
  });

  const standUp = await interactionRepo.create({
    ...baseInfo,
    interactionId: 2,
    text: '{{actorType player declension="nominative" capitalised=true}} аккуратно встаешь опираясь на стену. Все тело болит и сопротивляется.',
  });

  await parseMap(exitInteraction, onDied);

  const startSpot = await mapSpotRepo.findByParams({ ...baseInfo, x: 3, y: 3 });

  const builderOptionsTemplate = <const>{
    repositories: dbService.repositories,
    baseInfo,
  };

  await npcInteractionBuilder(
    'default', { ...builderOptionsTemplate, ...await getSpotAndRelatedMerchant(dbService, 1, 3) },
  );

  await actionRepo.create({
    ...baseInfo,
    from: intro.id,
    to: standUp.id,
    text: 'Встать',
    type: 'CUSTOM',
  });

  await actionRepo.create({
    ...baseInfo,
    from: standUp.id,
    to: startSpot.id,
    text: '',
    type: 'AUTO',
  });

  await eventBuilder(
    1, { ...builderOptionsTemplate, spot: await mapSpotRepo.findByParams({ ...baseInfo, x: 2, y: 3 }) },
  );

  return <const>{
    async inboundOnStart(connect: ConnectorTo) {
      await connect(intro, 'Начать сценарий!');
    },
    async outboundToReturn(returnInteraction: AbstractModel) {
      await actionRepo.create({
        ...baseInfo,
        from: exitInteraction.id,
        to: returnInteraction.id,
        text: 'Вернутся к выбору локаций',
        type: 'CUSTOM',
      });
      await actionRepo.create({
        ...baseInfo,
        from: onDied.id,
        to: returnInteraction.id,
        text: 'Вернутся к выбору локаций',
        type: 'CUSTOM',
      });
    },
  };
};
