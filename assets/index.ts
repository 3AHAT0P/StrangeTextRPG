/* eslint-disable no-await-in-loop */
import path from 'path';
import { createCanvas, loadImage } from 'node-canvas';

import { InteractionNeo4jRepository } from '../src/db/graph/InteractionNeo4jRepository';
import { ActionNeo4jRepository } from '../src/db/graph/ActionNeo4jRepository';
import { InteractionModel } from '../src/db/entities/Interaction';
import { buildDriver } from '../src/db';

const mapPath = path.resolve(__dirname, 'scenario5.location2.city.png');

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
};

type Structure = keyof typeof STRUCTURE_TO_COLOR;
type Color = typeof STRUCTURE_TO_COLOR[keyof typeof STRUCTURE_TO_COLOR];

const COLOR_TO_STRUCTURE = (Object.entries(STRUCTURE_TO_COLOR))
  .reduce((result, [key, value]) => {
    // eslint-disable-next-line no-param-reassign
    result[value] = key as Structure;
    return result;
  }, {} as Record<Color, Structure>);

const colorRGBToHEX = (r: number, g: number, b: number) => `${r.toString(16).padEnd(2, '0')}${g.toString(16).padEnd(2, '0')}${b.toString(16).padEnd(2, '0')}`;

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

  const imap = new Map<string, InteractionModel>();
  const MOVE_ACTIONS = {
    TO_WEST: '👣 ⬅️',
    TO_EAST: '👣 ➡️',
    TO_NORTH: '👣 ⬆️',
    TO_SOUTH: '👣 ⬇️',
    NO_WAY: '🚷',
  } as const;

  for (let i = 0; i < imageData.data.length; i += 4) {
    const y = Math.floor((i / 4) / imageData.width);
    const x = i / 4 - y * imageData.width;
    const text = COLOR_TO_STRUCTURE[colorRGBToHEX(
      imageData.data[i + 0],
      imageData.data[i + 1],
      imageData.data[i + 2],
    ) as Color];
    try {
      const inter = await interactionRepo.create({
        scenarioId: 3,
        locationId: 1,
        interactionId: i / 4,
        text,
      });
      console.log('X:Y', x, ':', y, text, inter);
      imap.set(`${x}:${y}`, inter);
      const above = imap.get(`${x}:${y - 1}`);
      if (above != null) {
        await actionRepo.create({
          scenarioId: 3,
          locationId: 1,
          from: inter.id,
          to: above.id,
          text: inter.text === 'WALL' || above.text === 'WALL' ? MOVE_ACTIONS.NO_WAY : MOVE_ACTIONS.TO_NORTH,
          type: 'CUSTOM',
        });
        await actionRepo.create({
          scenarioId: 3,
          locationId: 1,
          from: above.id,
          to: inter.id,
          text: inter.text === 'WALL' || above.text === 'WALL' ? MOVE_ACTIONS.NO_WAY : MOVE_ACTIONS.TO_SOUTH,
          type: 'CUSTOM',
        });
      }
      const left = imap.get(`${x - 1}:${y}`);
      if (left != null) {
        await actionRepo.create({
          scenarioId: 3,
          locationId: 1,
          from: inter.id,
          to: left.id,
          text: inter.text === 'WALL' || left.text === 'WALL' ? MOVE_ACTIONS.NO_WAY : MOVE_ACTIONS.TO_WEST,
          type: 'CUSTOM',
        });
        await actionRepo.create({
          scenarioId: 3,
          locationId: 1,
          from: left.id,
          to: inter.id,
          text: inter.text === 'WALL' || left.text === 'WALL' ? MOVE_ACTIONS.NO_WAY : MOVE_ACTIONS.TO_EAST,
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
