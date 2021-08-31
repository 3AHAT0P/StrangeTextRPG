import { Cursor } from '@db/Cursor';
import { DIProducer } from '@utils/DI';
import { SessionState } from 'SessionState';
import { AbstractScenario, ScenarioCallbacks } from './AbstractScenario';

export interface ScenarioFactoryOptions {
  cursor: Cursor;
  state: SessionState;
  callbacks: ScenarioCallbacks;
}

interface ScenarioFactory {
  new(cursor: Cursor, state: SessionState, callbacks: ScenarioCallbacks): AbstractScenario;
}

@DIProducer()
export class ScenarioManager {
  private readonly _scenarioFactoriesMap: Map<number, ScenarioFactory> = new Map();

  private readonly _scenarioMap: Map<number, AbstractScenario> = new Map();

  public registerScenarioFactory(id: number, scenarioFactory: ScenarioFactory): this {
    this._scenarioFactoriesMap.set(id, scenarioFactory);
    return this;
  }

  public addScenario(id: number, scenario: AbstractScenario): this {
    this._scenarioMap.set(id, scenario);
    return this;
  }

  public takeScenarioById(id: number): AbstractScenario | null {
    const scenario = this._scenarioMap.get(id);

    return scenario ?? null;
  }

  public takeOrCreateScenario(id: number, options: ScenarioFactoryOptions): Promise<AbstractScenario> {
    const scenario = this.takeScenarioById(id);
    if (scenario !== null) return Promise.resolve(scenario);

    return this.createScenario(id, options);
  }

  public async createScenario(
    id: number, { cursor, state, callbacks }: ScenarioFactoryOptions,
  ): Promise<AbstractScenario> {
    const ScenarioFactory = this._scenarioFactoriesMap.get(id);
    if (ScenarioFactory == null) throw new Error(`ScenarioFactory with id ${id} not registered`);

    const scenario = new ScenarioFactory(cursor, state, callbacks);
    this._scenarioMap.set(id, scenario);
    await scenario.init();

    return scenario;
  }
}
