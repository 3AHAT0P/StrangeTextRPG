import { AbstractEntity, AbstractModel } from './Abstract';
import type { BattleSpotSubtype } from './Battle';

export type MapSpotSubtype = 'UNREACHABLE' | 'BREAK' | 'WALL' | 'LOCATION_EXIT' | 'HOUSE' | 'HOUSE_DOOR'
| 'EMPTY'
| 'MERCHANT' | 'NPC' | 'QUEST_NPC'| 'GUARD' | 'BANDIT_GUARD'
| BattleSpotSubtype;

export interface MapSpotEntity extends AbstractEntity {
  x: number;
  y: number;
  subtype: MapSpotSubtype;
  isThroughable: boolean;
}

export const isThroughable = (subtype: MapSpotSubtype): boolean => (
  !['UNREACHABLE', 'BREAK', 'WALL', 'HOUSE'].includes(subtype)
);

export class MapSpotModel extends AbstractModel {
  public readonly x: number;

  public readonly y: number;

  public readonly subtype: MapSpotSubtype;

  public readonly isThroughable: boolean;

  constructor(data: MapSpotEntity) {
    super(data);
    this.x = data.x;
    this.y = data.y;
    this.subtype = data.subtype;
    this.isThroughable = data.isThroughable;
  }
}
