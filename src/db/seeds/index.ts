import { DBService } from '../DBService';

import { introSeedRun } from './intro';
import { demoBaseSeedRun } from './DemoBase';
import { demoBattleSeedRun } from './DemoBattle';

const main = async () => {
  const dbService = new DBService();
  const introConnectors = await introSeedRun(dbService);
  const demoBaseConnectors = await demoBaseSeedRun(dbService);
  const demoBattleConnectors = await demoBattleSeedRun(dbService);

  await introConnectors.inboundOnExit(demoBaseConnectors.outboundToExit);
  await introConnectors.inboundOnReturn(demoBaseConnectors.outboundToReturn);
  await introConnectors.inboundOnReturn(demoBattleConnectors.outboundToReturn);

  await demoBaseConnectors.inboundOnStart(introConnectors.outboundToDemoScenario);
  await demoBattleConnectors.inboundOnStart(introConnectors.outboundToDemoScenario);

  await dbService.destructor();
};

main();
