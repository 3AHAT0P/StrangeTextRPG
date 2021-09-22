/* eslint-disable no-await-in-loop */
import { AbstractActor, AttackResult } from '@actors/AbstractActor';
import { AbstractUI } from '@ui';
import { ActionsLayout } from '@ui/ActionsLayout';
import { Template } from '@utils/Template';

export interface BattleOptions {
  ui: AbstractUI;
  player: AbstractActor;
  enemies: AbstractActor[];
}

const ACTIONS = {
  attack: 'Атаковать 🗡',
  examine: 'Осмотреть 👀',
  back: 'Назад',
  leave: 'Убежать из боя',
} as const;

type ACTION_VALUES = typeof ACTIONS[keyof typeof ACTIONS];

export const BATTLE_FINAL_ACTIONS = {
  PLAYER_DIED: 'onDied',
  PLAYER_WIN: 'onWin',
  LEAVE: 'onLeave',
} as const;

export type BATTLE_FINAL_ACTIONS_VALUES = typeof BATTLE_FINAL_ACTIONS[keyof typeof BATTLE_FINAL_ACTIONS];

const TEMPLATES = <const>{
  firstMessage: new Template<{ attacker: AbstractActor; attacked: AbstractActor[] }>(
    '{{actorType attacker declension="nominative" capitalised=true}} встретил'
    + '{{#each attacked}}'
    + ' {{actorType this declension="accusative" withPostfix=true}} {{#unless @last}} и {{/unless}}\n'
    + '{{/each}}'
    + 'Они все хотят кушать, а ты выглядишь очень аппетитно.\n',
  ),

  examineEnemyAction: new Template<{ enemy: AbstractActor }>(
    'Осмотреть {{actorType enemy declension="accusative" withPostfix=true}}',
  ),
  examineEnemyFirstMessage: new Template<{ player: AbstractActor, enemy: AbstractActor }>(
    '{{actorType player declension="nominative" capitalised=true}} осматриваешь {{actorType enemy declension="accusative" withPostfix=true}}',
  ),
  examineEnemyCharacteristicsMessage: new Template<{ stats: AbstractActor['stats'] }>(
    'Xарактеристики:\n'
    + '  Очки здоровья(❤️) - {{get stats "healthPoints"}} / {{get stats "maxHealthPoints"}}\n'
    + '  Защита(🛡) - {{get stats "armor"}}\n'
    + '  Сила удара(🗡) - {{get stats "attackDamage"}}\n'
    + '  Шанс попасть ударом(🎯) - {{get stats "accuracy"}}\n'
    + '  Шанс попасть в уязвимое место(‼️) - {{get stats "criticalChance"}}\n'
    + '  Модификатор критического урона(✖️) - {{get stats "criticalDamageModifier"}}\n',
  ),

  attackEnemyAction: new Template<{ enemy: AbstractActor }>(
    'Атаковать {{actorType enemy declension="accusative" withPostfix=true}}',
  ),

  attackMessage: new Template <{ attacker: AbstractActor; attacked: AbstractActor; attackResult: AttackResult }>(
    '{{actorType attacker declension="nominative" capitalised=true withPostfix=true}} нанес'
    + '{{actorType attacked declension="dative" capitalised=true withPostfix=true}} {{showDamage attackResult}}',
  ),

  roundResultMessage: new Template<{ player: AbstractActor; aliveEnemies: AbstractActor[] }>(
    '⚔️Результаты раунда:\n'
    + ' - У {{actorType player declension="genitive"}} осталось {{showActorHealthPoints player}} ОЗ;\n'
    + '{{#each aliveEnemies}}'
    + ' - У {{actorType this declension="genitive" withPostfix=true}} осталось {{showActorHealthPoints this}} ОЗ;\n'
    + '{{/each}}',
  ),
};

const interactWithUser = async (
  ui: AbstractUI, aliveEnemies: AbstractActor[], template: Template<{ enemy: AbstractActor }>,
): Promise<AbstractActor | null> => {
  const actions = aliveEnemies.map(
    (enemy) => template.clone({ enemy }).value,
  );
  const choosedAction = await ui.interactWithUser(
    new ActionsLayout().addRow(...actions.concat([ACTIONS.back])),
  );

  if (choosedAction === ACTIONS.back) return null;

  const actionId = actions.indexOf(choosedAction);

  return aliveEnemies[actionId];
};

type ActionHandler = (
  ui: AbstractUI, player: AbstractActor, aliveEnemies: AbstractActor[],
) => Promise<ACTION_VALUES | null>;

const ACTION_HANDLERS = <const>{
  [ACTIONS.examine]: async (
    ui: AbstractUI, player: AbstractActor, aliveEnemies: AbstractActor[],
  ): Promise<typeof ACTIONS['examine'] | null> => {
    const enemy = await interactWithUser(ui, aliveEnemies, TEMPLATES.examineEnemyAction);

    if (enemy === null) return null;

    const enemyStats = enemy.stats;
    await ui.sendToUser(TEMPLATES.examineEnemyFirstMessage.clone({ player, enemy }).value);
    await ui.sendToUser(TEMPLATES.examineEnemyCharacteristicsMessage.clone({ stats: enemyStats }).value);

    return ACTIONS.examine;
  },
  [ACTIONS.attack]: async (
    ui: AbstractUI, player: AbstractActor, aliveEnemies: AbstractActor[],
  ): Promise<typeof ACTIONS['attack'] | null> => {
    const enemy = await interactWithUser(ui, aliveEnemies, TEMPLATES.attackEnemyAction);

    if (enemy === null) return null;

    const attackResult = player.doAttack(enemy);

    await ui.sendToUser(TEMPLATES.attackMessage.clone({ attacker: player, attacked: enemy, attackResult }).value);

    for (const aliveEnemy of aliveEnemies) {
      if (!aliveEnemy.isAlive) await ui.sendToUser(`${aliveEnemy.getDeathMessage()}.`);
    }

    return ACTIONS.attack;
  },
  [ACTIONS.back]: () => Promise.resolve(null),
};

const enemiesAttack = async (ui: AbstractUI, player: AbstractActor, aliveEnemies: AbstractActor[]): Promise<void> => {
  const attackResultMessage = aliveEnemies.map(
    (actor: AbstractActor) => (
      TEMPLATES.attackMessage.clone({
        attacker: actor,
        attacked: player,
        attackResult: actor.doAttack(player),
      }).value
    ),
  ).join('\n');
  if (attackResultMessage.trim() !== '') await ui.sendToUser(attackResultMessage);
};

const lootRewards = async (ui: AbstractUI, player: AbstractActor, enemies: AbstractActor[]): Promise<void> => {
  for (const enemy of enemies) {
    if (!enemy.isAlive) {
      const rewardMessage = enemy.getReward(player);
      await ui.sendToUser(rewardMessage);
    }
  }
};

export class Battle {
  private _ui: AbstractUI;

  private _player: AbstractActor;

  private _enemies: AbstractActor[];

  private _aliveEnemies: AbstractActor[];

  private get battleFinished(): boolean {
    return this._aliveEnemies.length === 0 || !this._player.isAlive;
  }

  constructor(options: BattleOptions) {
    this._ui = options.ui;
    this._player = options.player;
    this._enemies = options.enemies;
    this._aliveEnemies = this._enemies.filter((enemy) => enemy.isAlive);
  }

  public async activate(): Promise<BATTLE_FINAL_ACTIONS_VALUES> {
    if (!this.battleFinished) {
      await this._ui.sendToUser(
        TEMPLATES.firstMessage.clone({ attacker: this._player, attacked: this._enemies }).value,
      );
    }

    let choosedAction: ACTION_VALUES | null = null;

    while (!this.battleFinished) {
      const actions: Set<ACTION_VALUES> = new Set([ACTIONS.attack, ACTIONS.examine, ACTIONS.leave]);

      if (choosedAction === null) {
        choosedAction = await this._ui.interactWithUser(new ActionsLayout<ACTION_VALUES>().addRow(...actions));
      }

      if (choosedAction === ACTIONS.leave) return BATTLE_FINAL_ACTIONS.LEAVE;

      const handler: ActionHandler = ACTION_HANDLERS[choosedAction];

      choosedAction = await handler(this._ui, this._player, this._aliveEnemies);

      if (choosedAction === null) continue; // null returned only when <back> pressed

      this._aliveEnemies = this._enemies.filter((enemy) => enemy.isAlive);

      await enemiesAttack(this._ui, this._player, this._enemies);

      await this._ui.sendToUser(
        TEMPLATES.roundResultMessage.clone({ player: this._player, aliveEnemies: this._aliveEnemies }).value,
      );

      if (!this._player.isAlive) return BATTLE_FINAL_ACTIONS.PLAYER_DIED;
    }

    await lootRewards(this._ui, this._player, this._enemies);

    return BATTLE_FINAL_ACTIONS.PLAYER_WIN;
  }
}
