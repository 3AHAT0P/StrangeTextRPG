import { AbstractHumanoid } from '@actors/AbstractHumanoid';

import { NPCId } from './@types';

export abstract class AbstractNPC extends AbstractHumanoid {
  protected readonly abstract _id: NPCId;

  public get id(): AbstractNPC['_id'] { return this._id; }

  public readonly abstract name: string;
}
