/* eslint-disable no-await-in-loop */
import path from 'path';
import {
  DataContainer,
  AbstractEntity, BattleEntity, InteractionEntity,
  MapSpotEntity, NPCEntity,
} from '@db/entities';
import { Listener, Matcher } from '@utils/Matcher';
import { ActionProperties } from '@db/graph/ActionNeo4jRepository';

import { DBService } from '../DBService';

const pathToGeneratedDbSeeds = path.join(__dirname, '..', '..', '..', 'db', 'seeds');

const main = async () => {
  const dbService = new DBService();

  const actions: Array<ActionProperties & {
    from: string;
    to: string;
  }> = [];

  const matcher = new Matcher<DataContainer<AbstractEntity>['type'], '', Omit<AbstractEntity, 'id'>>();

  const createMapSpot = async (entity: MapSpotEntity) => {
    await dbService.repositories.mapSpotRepo.create(entity);
  };
  const createInteraction = async (entity: InteractionEntity) => {
    await dbService.repositories.interactionRepo.create(entity);
  };
  const createBattle = async (entity: BattleEntity) => {
    await dbService.repositories.battleRepo.create(entity);
  };
  const createNPC = async (entity: NPCEntity) => {
    await dbService.repositories.npcRepo.create(entity);
  };

  matcher
    .on('MapSpot', createMapSpot as Listener<Omit<AbstractEntity, 'id'>>)
    .on('Interaction', createInteraction as Listener<Omit<AbstractEntity, 'id'>>)
    .on('Battle', createBattle as Listener<Omit<AbstractEntity, 'id'>>)
    .on('NPC', createNPC as Listener<Omit<AbstractEntity, 'id'>>);

  const readAndFillDB = async (pathToSeed: string) => {
    const data: Record<string, DataContainer<AbstractEntity>> = (await import(pathToSeed)).default;

    for (const [id, { type, entity, links }] of Object.entries(data)) {
      actions.push(...(
        links.map((link) => ({
          ...link,
          toInteractionId: link.to,
          from: id,
        }))
      ));

      await matcher.run(type, entity);
    }
  };

  try {
    await readAndFillDB(path.join(pathToGeneratedDbSeeds, 'intro.json'));
    await readAndFillDB(path.join(pathToGeneratedDbSeeds, 'demoBase.json'));
    await readAndFillDB(path.join(pathToGeneratedDbSeeds, 'demoBattle.json'));
    await readAndFillDB(path.join(pathToGeneratedDbSeeds, 'demoMerchant.json'));
    // await readAndFillDB(path.join(pathToGeneratedDbSeeds, 'scenario5Location1.json'));
    await readAndFillDB(path.join(pathToGeneratedDbSeeds, 'scenarioTestLocation.json'));

    for (const action of actions) {
      // await action();
      await dbService.repositories.actionRepo.cleanCreate(action);
    }
  } catch (err) {
    console.error(err);
  } finally {
    await dbService.destructor();
  }
};

main();