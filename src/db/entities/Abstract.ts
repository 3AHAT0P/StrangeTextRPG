export interface AbstractEntity {
  id: number;
  scenarioId: number;
  locationId: number;
  interactionId: string;
}

export abstract class AbstractModel {
  protected _id: number;

  public get id(): number { return this._id; }

  public readonly scenarioId: number;

  public readonly locationId: number;

  public readonly interactionId: string;

  constructor(data: AbstractEntity) {
    this._id = data.id;
    this.scenarioId = data.scenarioId;
    this.locationId = data.locationId;
    this.interactionId = data.interactionId;
  }
}
