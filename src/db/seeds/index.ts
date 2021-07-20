import { DBService } from '../DBService';

import { introSeedRun } from './intro';
import { demoBaseSeedRun } from './DemoBase';
import { demoBattleSeedRun } from './DemoBattle';
import { demoMerchantSeedRun } from './DemoMerchant';
import { scenario5Location1SeedRun } from './main/scenario5.location1';
import { scenarioTestLocation1SeedRun } from './test/scenario-test.location1';

const main = async () => {
  const dbService = new DBService();
  const introConnectors = await introSeedRun(dbService);
  const demoBaseConnectors = await demoBaseSeedRun(dbService);
  const demoBattleConnectors = await demoBattleSeedRun(dbService);
  const demoMerchantConnectors = await demoMerchantSeedRun(dbService);
  const scenario5Location1Connectors = await scenario5Location1SeedRun(dbService);
  const scenarioTestLocation1Connectors = await scenarioTestLocation1SeedRun(dbService);

  await introConnectors.inboundOnExit(demoBaseConnectors.outboundToExit);
  await introConnectors.inboundOnReturn(demoBaseConnectors.outboundToReturn);
  await introConnectors.inboundOnReturn(demoBattleConnectors.outboundToReturn);
  await introConnectors.inboundOnReturn(demoMerchantConnectors.outboundToReturn);
  await introConnectors.inboundOnReturn(scenario5Location1Connectors.outboundToReturn);
  await introConnectors.inboundOnReturn(scenarioTestLocation1Connectors.outboundToReturn);

  await demoBaseConnectors.inboundOnStart(introConnectors.outboundToDemoScenario);
  await demoBattleConnectors.inboundOnStart(introConnectors.outboundToDemoScenario);
  await demoMerchantConnectors.inboundOnStart(introConnectors.outboundToDemoScenario);
  await scenario5Location1Connectors.inboundOnStart(introConnectors.outboundToScenario);
  await scenarioTestLocation1Connectors.inboundOnStart(introConnectors.outboundToDemoScenario);

  await dbService.destructor();
};

main();
