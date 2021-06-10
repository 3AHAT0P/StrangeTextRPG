export interface AbstractEntity {
  id: number;
  scenarioId: number;
  locationId: number;
}

export abstract class AbstractModel implements AbstractEntity {
  protected _id: number;

  public get id(): number { return this._id; }

  public readonly scenarioId: number;

  public readonly locationId: number;

  constructor(data: AbstractEntity) {
    this._id = data.id;
    this.scenarioId = data.scenarioId;
    this.locationId = data.locationId;
  }
}
