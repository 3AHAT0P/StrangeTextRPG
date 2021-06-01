import path from 'path';
import { createCanvas, loadImage } from 'node-canvas';

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

loadImage(mapPath)
  .then((image) => {
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, image.width, image.height);

    const imageData = ctx.getImageData(0, 0, image.width, image.height);

    for (let i = 0; i < imageData.data.length; i += 4) {
      const y = Math.floor((i / 4) / imageData.width);
      const x = i / 4 - y * imageData.width;
      console.log(
        'X:Y', x, ':', y,
        COLOR_TO_STRUCTURE[colorRGBToHEX(
          imageData.data[i + 0],
          imageData.data[i + 1],
          imageData.data[i + 2],
        ) as Color],
      );
    }
  })
  .catch(() => {});
