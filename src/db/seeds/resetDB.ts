import { DBService } from '../DBService';

const main = async () => {
  const dbService = new DBService();

  await dbService.runRawQuery('match (n) detach delete n');

  await dbService.destructor();
};

main();
