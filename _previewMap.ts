import path from 'path';
import { POIIcon } from '@locations/AreaMap';
import { Size } from '@utils/@types';

// eslint-disable-next-line import/no-dynamic-require, global-require, @typescript-eslint/no-var-requires
const { map, mapSize } = require(path.resolve(__dirname, process.argv[2])) as { map: POIIcon[], mapSize: Size };

const previewMap = () => {
  let result = '';
  for (let y = 0; y < mapSize.height; y += 1) {
    for (let x = 0; x < mapSize.width; x += 1) {
      result += map[y * mapSize.width + x];
      result += ' ';
    }
    result = `${result.trim()}\n`;
  }
  console.log(result);
};

previewMap();
