import path from 'path';
import { MapParser } from '@utils/LocationMapParser/MapParser';

// const mapPath = path.resolve(__dirname, 'scenario5.location2.city.png');

const main = async () => {
  const mapPath = path.resolve(__dirname, 'test.location.png');
  const mapParser = new MapParser(mapPath, {
    scenarioId: 3,
    locationId: 1,
  });

  await mapParser.init();

  await mapParser.parse();

  await mapParser.destructor();
};

main();
