import { ActionBattleSubtypes } from '@db/entities/Action';
import { MESSAGES } from '@translations/ru';

import { BaseUserActSelector, createUserAction, UserAction } from './BaseUserActSelector';

const { battleActions, commonActions } = MESSAGES;

export interface BattleAtcWithEnemy {
  text: string;
  type: `ATTACK_${number}` | `EXAMINE_${number}`;
}

export class BattleUserActSelector extends BaseUserActSelector {
  protected _staticLayout: UserAction[][] = [];

  protected _dynamicLayout: UserAction[][] = [];

  protected _firstLayout: UserAction[][] = [
    [
      createUserAction(1, battleActions.ATTACK, 'ATTACK'),
      createUserAction(2, battleActions.EXAMINE, 'EXAMINE'),
    ],
    [
      createUserAction(3, battleActions.LEAVE, 'BATTLE_LEAVE'),
    ],
  ];

  protected _idSequence: number = 1;

  // eslint-disable-next-line class-methods-use-this
  protected _buildLayout(enemies: BattleAtcWithEnemy[]): UserAction[][] {
    const layout: UserAction[][] = [];

    let index: number = 0;
    for (const enemy of enemies) {
      if (layout[Math.trunc(index / 3)] == null) layout[Math.trunc(index / 3)] = [];
      layout[Math.trunc(index / 3)].push(createUserAction(index + 1, enemy.text, enemy.type));
      index += 1;
    }

    layout.push([createUserAction(index + 1, commonActions.BACK, 'BACK')]);

    return layout;
  }

  public override show<T = any>(
    enemies: BattleAtcWithEnemy[] | null = null,
  ): Promise<[ActionBattleSubtypes, UserAction['originalAction'], T]> {
    if (enemies !== null) this._dynamicLayout = this._buildLayout(enemies);
    else this._dynamicLayout = this._firstLayout;

    return super.show() as Promise<[ActionBattleSubtypes, UserAction['originalAction'], T]>;
  }
}
