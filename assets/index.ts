/* eslint-disable no-await-in-loop */
import path from 'path';
import { createCanvas, loadImage } from 'node-canvas';

import { InteractionNeo4jRepository } from '@db/graph/InteractionNeo4jRepository';
import { ActionNeo4jRepository } from '@db/graph/ActionNeo4jRepository';
import { MapSpotNeo4jRepository } from '@db/graph/MapSpotNeo4jRepository';
import { NPCNeo4jRepository } from '@db/graph/NPCNeo4jRepository';
import { BattleNeo4jRepository } from '@db/graph/BattleNeo4jRepository';
import { InteractionModel } from '@db/entities/Interaction';
import { MapSpotModel, MapSpotSubtype } from '@db/entities/MapSpot';
import { NPCModel, NPCSubtype } from '@db/entities/NPC';
import { BattleModel, BattleDifficulty } from '@db/entities/Battle';
import { buildDriver } from '@db';

// const mapPath = path.resolve(__dirname, 'scenario5.location2.city.png');
const mapPath = path.resolve(__dirname, 'test.location.png');

const STRUCTURE_TO_COLOR = <const>{
  WALL: '808080',
  HOUSE: 'c0c0c0',
  EMPTY: 'ffffff',
  GUARD: 'f44336',
  HOUSE_DOOR: 'ffff8d',
  MERCHANT: '0000ff',
  BANDIT_GUARD: '008000',
  NPC: '00ffff',
  QUEST_NPC: '800080',
  BATTLE_VERY_EASY: 'ffaaaa', // 633636
  BATTLE_EASY: 'ff8080', // 6b2e2e
  BATTLE_MEDIUM: 'ff6060', // 732626
  BATTLE_HARD: 'ff4040', // 7a1f1f
  BATTLE_VERY_HARD: 'ff2020', // 821717
};

const isBattleSubtype = (subtype: MapSpotSubtype): subtype is 'BATTLE_VERY_EASY' | 'BATTLE_EASY' | 'BATTLE_MEDIUM' | 'BATTLE_HARD' | 'BATTLE_VERY_HARD' => (
  ['BATTLE_VERY_EASY', 'BATTLE_EASY', 'BATTLE_MEDIUM', 'BATTLE_HARD', 'BATTLE_VERY_HARD'].includes(subtype)
);

type Color = typeof STRUCTURE_TO_COLOR[keyof typeof STRUCTURE_TO_COLOR];

const COLOR_TO_STRUCTURE = (Object.entries(STRUCTURE_TO_COLOR))
  .reduce((result, [key, value]) => {
    // eslint-disable-next-line no-param-reassign
    result[value] = key as MapSpotSubtype;
    return result;
  }, {} as Record<Color, MapSpotSubtype>);

const colorRGBToHEX = (r: number, g: number, b: number) => `${r.toString(16).padEnd(2, '0')}${g.toString(16).padEnd(2, '0')}${b.toString(16).padEnd(2, '0')}`;

const MOVE_ACTIONS = {
  TO_WEST: '👣 ⬅️',
  TO_EAST: '👣 ➡️',
  TO_NORTH: '👣 ⬆️',
  TO_SOUTH: '👣 ⬇️',
  NO_WAY: '🚷',
} as const;

const isThroughable = (subtype: MapSpotSubtype): boolean => !['WALL', 'HOUSE'].includes(subtype);

let globalNPCIdIndex = 1;

const main = async () => {
  const image = await loadImage(mapPath);

  const canvas = createCanvas(image.width, image.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, image.width, image.height);

  const imageData = ctx.getImageData(0, 0, image.width, image.height);

  const driver = buildDriver();
  const session = driver.session();
  const interactionRepo = new InteractionNeo4jRepository(session);
  const actionRepo = new ActionNeo4jRepository(session);
  const mapSpotRepo = new MapSpotNeo4jRepository(session);
  const NPCRepo = new NPCNeo4jRepository(session);
  const BattleRepo = new BattleNeo4jRepository(session);

  const mapSpots = new Map<string, MapSpotModel>();

  for (let i = 0; i < imageData.data.length; i += 4) {
    const y = Math.floor((i / 4) / imageData.width);
    const x = i / 4 - y * imageData.width;
    const subtype = COLOR_TO_STRUCTURE[colorRGBToHEX(
      imageData.data[i + 0],
      imageData.data[i + 1],
      imageData.data[i + 2],
    ) as Color];
    try {
      const currentSpot = await mapSpotRepo.create({
        scenarioId: 3,
        locationId: 1,
        x,
        y,
        subtype,
        isThroughable: isThroughable(subtype),
      });
      console.log(currentSpot);
      mapSpots.set(`${x}:${y}`, currentSpot);
      if (subtype === 'MERCHANT') {
        const npc = await NPCRepo.create({
          scenarioId: 3,
          locationId: 1,
          NPCId: globalNPCIdIndex,
          subtype,
        });
        await actionRepo.create({
          scenarioId: 3,
          locationId: 1,
          from: currentSpot.id,
          to: npc.id,
          text: `💬 Поговорить с торговцем (#${globalNPCIdIndex})`,
          type: 'CUSTOM',
        });
        await actionRepo.create({
          scenarioId: 3,
          locationId: 1,
          from: npc.id,
          to: currentSpot.id,
          text: 'OnDialogEnd',
          type: 'SYSTEM',
        });
        globalNPCIdIndex += 1;
      } else if (isBattleSubtype(subtype)) {
        const battle = await BattleRepo.create({
          scenarioId: 3,
          locationId: 1,
          difficult: subtype.slice(7) as BattleDifficulty,
          chanceOfTriggering: 0.95,
        });
        await actionRepo.create({
          scenarioId: 3,
          locationId: 1,
          from: currentSpot.id,
          to: battle.id,
          text: '',
          type: 'AUTO',
        });
        await actionRepo.create({
          scenarioId: 3,
          locationId: 1,
          from: battle.id,
          to: currentSpot.id,
          text: 'OnBattleEnd',
          type: 'SYSTEM',
        });
      }

      const above = mapSpots.get(`${x}:${y - 1}`);
      if (above != null) {
        await actionRepo.create({
          scenarioId: 3,
          locationId: 1,
          from: currentSpot.id,
          to: above.id,
          text: currentSpot.isThroughable && above.isThroughable ? MOVE_ACTIONS.TO_NORTH : MOVE_ACTIONS.NO_WAY,
          type: 'CUSTOM',
        });
        await actionRepo.create({
          scenarioId: 3,
          locationId: 1,
          from: above.id,
          to: currentSpot.id,
          text: currentSpot.isThroughable && above.isThroughable ? MOVE_ACTIONS.TO_SOUTH : MOVE_ACTIONS.NO_WAY,
          type: 'CUSTOM',
        });
      }
      const left = mapSpots.get(`${x - 1}:${y}`);
      if (left != null) {
        await actionRepo.create({
          scenarioId: 3,
          locationId: 1,
          from: currentSpot.id,
          to: left.id,
          text: currentSpot.isThroughable && left.isThroughable ? MOVE_ACTIONS.TO_WEST : MOVE_ACTIONS.NO_WAY,
          type: 'CUSTOM',
        });
        await actionRepo.create({
          scenarioId: 3,
          locationId: 1,
          from: left.id,
          to: currentSpot.id,
          text: currentSpot.isThroughable && left.isThroughable ? MOVE_ACTIONS.TO_EAST : MOVE_ACTIONS.NO_WAY,
          type: 'CUSTOM',
        });
      }
    } catch (e) {
      console.log('!@#!@#', e);
    }
  }
  await session.close();
  await driver.close();
};

main();
