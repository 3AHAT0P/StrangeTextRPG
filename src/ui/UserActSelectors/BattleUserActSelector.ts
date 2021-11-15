import { ActionBattleSubtypes } from '@db/entities/Action';
import { MESSAGES } from '@translations/ru';

import { BaseUserActSelector, UserAction } from './BaseUserActSelector';

const { battleActions } = MESSAGES;

export interface BattleAtcWithEnemy {
  text: string;
  type: `ATTACK_${number}` | `EXAMINE_${number}`;
}

export class BattleUserActSelector extends BaseUserActSelector {
  private _firstLayout: UserAction[][] = [
    [
      { id: 1, text: battleActions.ATTACK, type: 'ATTACK' },
      { id: 2, text: battleActions.EXAMINE, type: 'EXAMINE' },
    ],
    [
      { id: 3, text: battleActions.LEAVE, type: 'BATTLE_LEAVE' },
    ],
  ];

  protected _layout: UserAction[][] = [];

  protected _idSequence: number = 4;

  // eslint-disable-next-line class-methods-use-this
  protected _buildLayout(enemies: BattleAtcWithEnemy[]): UserAction[][] {
    const layout: UserAction[][] = [];

    let index: number = 0;
    for (const enemy of enemies) {
      layout[Math.trunc(index / 3)].push({
        id: index + 1,
        text: enemy.text,
        type: enemy.type,
      });
      index += 1;
    }

    layout.push([
      { id: index + 1, text: battleActions.BACK, type: 'BACK' },
    ]);

    return layout;
  }

  public override show(enemies: BattleAtcWithEnemy[] | null = null): Promise<ActionBattleSubtypes> {
    if (enemies !== null) this._layout = this._buildLayout(enemies);
    else this._layout = this._firstLayout;

    return super.show() as Promise<ActionBattleSubtypes>;
  }
}
