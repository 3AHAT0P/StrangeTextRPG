import { AbstractEntity, AbstractModel } from './Abstract';

export type BattleDifficulty = 'VERY_EASY' | 'EASY' | 'MEDIUM' | 'HARD' | 'VERY_HARD';

export interface BattleEntity extends AbstractEntity {
  difficult: BattleDifficulty;
  chanceOfTriggering: number;
}

export class BattleModel extends AbstractModel implements BattleEntity {
  public readonly difficult: BattleDifficulty;

  public readonly chanceOfTriggering: number;

  constructor(data: BattleEntity) {
    super(data);
    this.difficult = data.difficult;
    this.chanceOfTriggering = data.chanceOfTriggering;
  }
}
