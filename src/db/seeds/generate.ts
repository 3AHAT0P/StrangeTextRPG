import path from 'path';
import { promises as fs } from 'fs';

import { introSeedRun } from './intro';
import { demoBaseSeedRun } from './DemoBase';
import { demoBattleSeedRun } from './DemoBattle';
import { demoMerchantSeedRun } from './DemoMerchant';
// import { scenario5Location1SeedRun } from './main/scenario5.location1';
import { scenarioTestLocation1SeedRun } from './test/scenario-test.location1';

const pathToGeneratedDbSeeds = path.join('db', 'seeds');

const main = async () => {
  const introSeedResult = introSeedRun();
  const demoBaseSeedResult = demoBaseSeedRun();
  const demoBattleSeedResult = demoBattleSeedRun();
  const demoMerchantSeedResult = demoMerchantSeedRun();
  // const scenario5Location1SeedResult = await scenario5Location1SeedRun();
  const scenarioTestLocation1SeedResult = await scenarioTestLocation1SeedRun();

  introSeedResult.inboundOnExit(demoBaseSeedResult.outboundToExit);
  introSeedResult.inboundOnReturn(demoBaseSeedResult.outboundToReturn);
  introSeedResult.inboundOnReturn(demoBattleSeedResult.outboundToReturn);
  introSeedResult.inboundOnReturn(demoMerchantSeedResult.outboundToReturn);
  // introSeedResult.inboundOnReturn(scenario5Location1SeedResult.outboundToReturn);
  introSeedResult.inboundOnReturn(scenarioTestLocation1SeedResult.outboundToReturn);

  demoBaseSeedResult.inboundOnStart(introSeedResult.outboundToDemoScenario);
  demoBattleSeedResult.inboundOnStart(introSeedResult.outboundToDemoScenario);
  demoMerchantSeedResult.inboundOnStart(introSeedResult.outboundToDemoScenario);
  // scenario5Location1SeedResult.inboundOnStart(introSeedResult.outboundToScenario);
  scenarioTestLocation1SeedResult.inboundOnStart(introSeedResult.outboundToDemoScenario);

  await fs.mkdir(pathToGeneratedDbSeeds, { recursive: true });
  await fs.writeFile(
    path.join(pathToGeneratedDbSeeds, 'intro.json'),
    JSON.stringify(introSeedResult.data),
  );
  await fs.writeFile(
    path.join(pathToGeneratedDbSeeds, 'demoBase.json'),
    JSON.stringify(demoBaseSeedResult.data),
  );
  await fs.writeFile(
    path.join(pathToGeneratedDbSeeds, 'demoBattle.json'),
    JSON.stringify(demoBattleSeedResult.data),
  );
  await fs.writeFile(
    path.join(pathToGeneratedDbSeeds, 'demoMerchant.json'),
    JSON.stringify(demoMerchantSeedResult.data),
  );
  // await fs.writeFile(
  //   path.join(pathToGeneratedDbSeeds, 'scenario5Location1.json'),
  //   JSON.stringify(scenario5Location1SeedResult.data),
  // );
  await fs.writeFile(
    path.join(pathToGeneratedDbSeeds, 'scenarioTestLocation.json'),
    JSON.stringify(scenarioTestLocation1SeedResult.data),
  );
};

main();
