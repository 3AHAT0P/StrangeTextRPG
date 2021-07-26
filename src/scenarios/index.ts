import { DemoBaseScenario } from './DemoBaseScenario';
import { DemoBattleScenario } from './DemoBattleScenario';
import { DemoMerchantScenario } from './DemoMerchantScenario';
import { IntroScenario } from './IntroScenario';
import { ScenarioNo5 } from './Scenario5';
import { ScenarioNoTest } from './Scenario5/test';
import { ScenarioManager } from './ScenarioManager';

const scenarioManager = new ScenarioManager();

scenarioManager.registerScenarioFactory(0, IntroScenario);
scenarioManager.registerScenarioFactory(900, DemoBaseScenario);
scenarioManager.registerScenarioFactory(901, DemoBattleScenario);
scenarioManager.registerScenarioFactory(902, DemoMerchantScenario);
scenarioManager.registerScenarioFactory(10001, ScenarioNoTest);
scenarioManager.registerScenarioFactory(5, ScenarioNo5);

export { scenarioManager };
