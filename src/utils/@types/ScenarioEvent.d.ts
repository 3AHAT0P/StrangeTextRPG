export interface ScenarioEvent<TState = number> {
  readonly state: TState;
  updateState(newState: TState): void;
  stateDidUpdated(state: TState): void;
}
