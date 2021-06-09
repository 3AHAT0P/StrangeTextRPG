import { AbstractEntity, AbstractModel } from './Abstract';
import { MapSpotSubtype } from './MapSpot';

export type BattleDifficulty = 'VERY_EASY' | 'EASY' | 'MEDIUM' | 'HARD' | 'VERY_HARD';

export interface BattleEntity extends AbstractEntity {
  difficult: BattleDifficulty;
  chanceOfTriggering: number;
}

export const isBattleSubtype = (subtype: MapSpotSubtype): subtype is 'BATTLE_VERY_EASY' | 'BATTLE_EASY' | 'BATTLE_MEDIUM' | 'BATTLE_HARD' | 'BATTLE_VERY_HARD' => (
  ['BATTLE_VERY_EASY', 'BATTLE_EASY', 'BATTLE_MEDIUM', 'BATTLE_HARD', 'BATTLE_VERY_HARD'].includes(subtype)
);

export class BattleModel extends AbstractModel implements BattleEntity {
  public readonly difficult: BattleDifficulty;

  public readonly chanceOfTriggering: number;

  constructor(data: BattleEntity) {
    super(data);
    this.difficult = data.difficult;
    this.chanceOfTriggering = data.chanceOfTriggering;
  }
}
