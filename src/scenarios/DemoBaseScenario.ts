import { BaseScenarioContext } from './@types';
import { AbstractScenario } from './AbstractScenario';

export class DemoBaseScenario extends AbstractScenario<BaseScenarioContext> {
  protected _scenarioId: number = 900;

  protected _buildContext(): BaseScenarioContext {
    return {
      additionalInfo: this._state.additionalInfo,
      player: this._state.player,
    };
  }
}
