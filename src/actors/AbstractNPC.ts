import { AbstractHumanoid } from './AbstractHumanoid';

export abstract class AbstractNPC extends AbstractHumanoid {
  protected readonly abstract _id: `Scenario:${number | string}|Location:${number}|NPC:${number}`;

  public get id(): AbstractNPC['_id'] { return this._id; }

  public readonly abstract name: string;
}
