import { Player } from '@actors/Player';
import { AdditionalSessionInfo } from '@ui';
import { ScenarioEvent } from '@utils/@types/ScenarioEvent';

export interface ScenarioContext {
  additionalInfo: AdditionalSessionInfo;
  player: Player;
  events: Record<number, ScenarioEvent>;
}
