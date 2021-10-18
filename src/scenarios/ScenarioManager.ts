import { Cursor } from '@db/Cursor';
import { SessionState } from 'SessionState';
import { BaseScenarioContext } from './@types';
import { AbstractScenario, ScenarioCallbacks } from './AbstractScenario';

import { DemoBaseScenario } from './DemoBaseScenario';
import { DemoBattleScenario } from './DemoBattleScenario';
import { DemoMerchantScenario } from './DemoMerchantScenario';
import { IntroScenario } from './IntroScenario';
import { ScenarioNo5 } from './Scenario5';
import { ScenarioNo5Test } from './Test1';

export interface ScenarioFactoryOptions {
  cursor: Cursor;
  state: SessionState;
  callbacks: ScenarioCallbacks;
}

type AbstractBaseScenario = AbstractScenario<BaseScenarioContext>;

interface ScenarioFactory {
  new(cursor: Cursor, state: SessionState, callbacks: ScenarioCallbacks): AbstractBaseScenario;
}

export class ScenarioManager {
  private readonly _scenarioFactoriesMap: Map<number, ScenarioFactory> = new Map();

  private readonly _scenarioMap: Map<number, AbstractBaseScenario> = new Map();

  constructor() {
    this.registerScenarioFactory(0, IntroScenario);
    this.registerScenarioFactory(900, DemoBaseScenario);
    this.registerScenarioFactory(901, DemoBattleScenario);
    this.registerScenarioFactory(902, DemoMerchantScenario);
    this.registerScenarioFactory(10001, ScenarioNo5Test);
    this.registerScenarioFactory(5, ScenarioNo5);
  }

  public registerScenarioFactory(id: number, scenarioFactory: ScenarioFactory): this {
    this._scenarioFactoriesMap.set(id, scenarioFactory);
    return this;
  }

  public addScenario(id: number, scenario: AbstractBaseScenario): this {
    this._scenarioMap.set(id, scenario);
    return this;
  }

  public takeScenarioById(id: number): AbstractBaseScenario | null {
    const scenario = this._scenarioMap.get(id);

    return scenario ?? null;
  }

  public takeOrCreateScenario(id: number, options: ScenarioFactoryOptions): Promise<AbstractBaseScenario> {
    const scenario = this.takeScenarioById(id);
    if (scenario !== null) return Promise.resolve(scenario);

    return this.createScenario(id, options);
  }

  public async createScenario(
    id: number, { cursor, state, callbacks }: ScenarioFactoryOptions,
  ): Promise<AbstractBaseScenario> {
    const ScenarioFactory = this._scenarioFactoriesMap.get(id);
    if (ScenarioFactory == null) throw new Error(`ScenarioFactory with id ${id} not registered`);

    const scenario = new ScenarioFactory(cursor, state, callbacks);
    this._scenarioMap.set(id, scenario);
    await scenario.init();
    // scenario.run();
    return scenario;
  }
}
