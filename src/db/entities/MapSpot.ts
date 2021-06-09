import { AbstractEntity, AbstractModel } from './Abstract';

export type MapSpotSubtype = 'UNREACHABLE' | 'BREAK' | 'WALL' | 'HOUSE' | 'HOUSE_DOOR'
| 'EMPTY'
| 'MERCHANT' | 'NPC' | 'QUEST_NPC'| 'GUARD' | 'BANDIT_GUARD'
| 'BATTLE_VERY_EASY' | 'BATTLE_EASY' | 'BATTLE_MEDIUM' | 'BATTLE_HARD' | 'BATTLE_VERY_HARD';

export interface MapSpotEntity extends AbstractEntity {
  x: number;
  y: number;
  subtype: MapSpotSubtype;
  isThroughable: boolean;
}

export const isThroughable = (subtype: MapSpotSubtype): boolean => (
  !['UNREACHABLE', 'BREAK', 'WALL', 'HOUSE'].includes(subtype)
);

export class MapSpotModel extends AbstractModel implements MapSpotEntity {
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
