import { Cursor } from '@db/Cursor';
import { SessionState } from 'SessionState';
import { BaseScenarioContext } from './@types';
import { AbstractScenario, ScenarioCallbacks } from './AbstractScenario';

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
