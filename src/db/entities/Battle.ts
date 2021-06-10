import { AbstractEntity, AbstractModel } from './Abstract';
import type { MapSpotSubtype } from './MapSpot';

export type BattleDifficulty = 'VERY_EASY' | 'EASY' | 'MEDIUM' | 'HARD' | 'VERY_HARD';

export type BattleChance = 'HIGHER' | 'HIGH' | 'MEDIUM' | 'LOW' | 'LOWER';

export type BattleSpotSubtype = `BATTLE#${BattleDifficulty}@${BattleChance}`;

export interface BattleEntity extends AbstractEntity {
  difficult: BattleDifficulty;
  chanceOfTriggering: number;
}

export const chanceOfTriggeringToNumber = <const>{
  HIGHER: 0.95,
  HIGH: 0.70,
  MEDIUM: 0.50,
  LOW: 0.25,
  LOWER: 0.05,
};

export const isBattleSubtype = (subtype: MapSpotSubtype): subtype is BattleSpotSubtype => subtype.startsWith('BATTLE#');

export const parseBattleSubtype = (subtype: BattleSpotSubtype): [difficult: BattleDifficulty, chance: number] => {
  const [, difficult, chance] = subtype.split(/@|#/ig);
  return [difficult as BattleDifficulty, chanceOfTriggeringToNumber[chance as BattleChance]];
};

export class BattleModel extends AbstractModel implements BattleEntity {
  public readonly difficult: BattleDifficulty;

  public readonly chanceOfTriggering: number;

  constructor(data: BattleEntity) {
    super(data);
    this.difficult = data.difficult;
    this.chanceOfTriggering = data.chanceOfTriggering;
  }
}
