/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const { map, mapSize } = require(path.resolve(__dirname, process.argv[2]));

const previewMap = () => {
  let result = '';
  for (let y = 0; y < mapSize.height; y++) {
    for (let x = 0; x < mapSize.width; x++) {
      result += map[y * mapSize.width + x];
      result += ' ';
    }
    result = result.trim() + '\n';
  }
  console.log(result);
};

previewMap();
