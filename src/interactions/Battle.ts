/* eslint-disable no-await-in-loop */
import { AbstractActor, AttackResult } from '@actors/AbstractActor';
import { AbstractUI } from '@ui';
import { ActionsLayout } from '@ui/ActionsLayout';
import { Template } from '@utils/Template';

export interface BattleInteractionOptions {
  ui: AbstractUI;
  player: AbstractActor;
  enemies: AbstractActor[];
}

const ACTIONS = {
  attack: 'Атаковать 🗡',
  examine: 'Осмотреть 👀',
  back: 'Назад',
} as const;

type ACTION_VALUES = typeof ACTIONS[keyof typeof ACTIONS];

export const BATTLE_FINAL_ACTIONS = {
  PLAYER_DIED: 'onDied',
  PLAYER_WIN: 'onWin',
} as const;

export type BATTLE_FINAL_ACTIONS_VALUES = typeof BATTLE_FINAL_ACTIONS[keyof typeof BATTLE_FINAL_ACTIONS];

const TEMPLATES = <const>{
  firstMessage: new Template<{ attacker: AbstractActor; attacked: AbstractActor[] }>(
    '{{actorType attacker declension="nominative" capitalised=true}} встретил'
    + '{{#each attacked as | enemy |}}'
    + ' {{actorType enemy declension="accusative" withPostfix=true}} {{#unless @last}} и {{/unless}}\n'
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
    + '  Очки здоровья(❤️) - {{get enemyStats "healthPoints"}} / {{get enemyStats "maxHealthPoints"}}\n'
    + '  Защита(🛡) - {{get enemyStats "armor"}}\n'
    + '  Сила удара(🗡) - {{get enemyStats "attackDamage"}}\n'
    + '  Шанс попасть ударом(🎯) - {{get enemyStats "accuracy"}}\n'
    + '  Шанс попасть в уязвимое место(‼️) - {{get enemyStats "criticalChance"}}\n'
    + '  Модификатор критического урона(✖️) - {{get enemyStats "criticalDamageModifier"}}\n',
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
    + '{{#each aliveEnemies as | enemy |}}'
    + ' - У {{actorType enemy declension="genitive" withPostfix=true}} осталось {{showActorHealthPoints enemy}} ОЗ;\n'
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

    for (const aliveEnemy of aliveEnemies.slice()) {
      if (!aliveEnemy.isAlive) {
        const index = aliveEnemies.indexOf(aliveEnemy);
        if (index < 0) continue;
        aliveEnemies.splice(index, 1);
        const rewardMessage = aliveEnemy.getReward(player);
        await ui.sendToUser(`${aliveEnemy.getDeathMessage()}.`);
        await ui.sendToUser(rewardMessage);
      }
    }

    return ACTIONS.attack;
  },
  [ACTIONS.back]: () => Promise.resolve(null),
};

export class BattleInteraction {
  private _ui: AbstractUI;

  private _player: AbstractActor;

  private _enemies: AbstractActor[];

  private _aliveEnemies: AbstractActor[];

  private get battleFinished(): boolean {
    return this._aliveEnemies.length === 0 || !this._player.isAlive;
  }

  constructor(options: BattleInteractionOptions) {
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
      const actions: Set<ACTION_VALUES> = new Set([ACTIONS.attack, ACTIONS.examine]);

      if (choosedAction === null) {
        choosedAction = await this._ui.interactWithUser(new ActionsLayout<ACTION_VALUES>().addRow(...actions));
      }

      const handler: ActionHandler = ACTION_HANDLERS[choosedAction];

      choosedAction = await handler(this._ui, this._player, this._aliveEnemies);

      const enemiesAttack = this._aliveEnemies.map(
        (actor: AbstractActor) => (
          TEMPLATES.attackMessage.clone({
            attacker: actor,
            attacked: this._player,
            attackResult: actor.doAttack(this._player),
          }).value
        ),
      ).join('\n');
      if (enemiesAttack !== '') await this._ui.sendToUser(enemiesAttack);

      await this._ui.sendToUser(
        TEMPLATES.roundResultMessage.clone({ player: this._player, aliveEnemies: this._aliveEnemies }).value,
      );

      if (!this._player.isAlive) return BATTLE_FINAL_ACTIONS.PLAYER_DIED;
    }

    return BATTLE_FINAL_ACTIONS.PLAYER_WIN;
  }
}
