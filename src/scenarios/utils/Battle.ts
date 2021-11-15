/* eslint-disable no-await-in-loop */
import { AbstractActor, AttackResult } from '@actors/AbstractActor';
import { ActionBattleSubtypes } from '@db/entities/Action';
import { AbstractUI } from '@ui/@types';
import { BattleAtcWithEnemy, BattleUserActSelector } from '@ui/UserActSelectors/BattleUserActSelector';
import { Template } from '@utils/Template';

export interface BattleOptions {
  ui: AbstractUI;
  player: AbstractActor;
  enemies: AbstractActor[];
}

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
    + ' {{actorType attacked declension="dative" capitalised=true withPostfix=true}} {{showDamage attackResult}}',
  ),

  roundResultMessage: new Template<{ player: AbstractActor; aliveEnemies: AbstractActor[] }>(
    '⚔️Результаты раунда:\n'
    + ' - У {{actorType player declension="genitive"}} осталось {{showActorHealthPoints player}} ОЗ;\n'
    + '{{#each aliveEnemies}}'
    + ' - У {{actorType this declension="genitive" withPostfix=true}} осталось {{showActorHealthPoints this}} ОЗ;\n'
    + '{{/each}}',
  ),
};

const attack = async (
  ui: AbstractUI, userActSelector: BattleUserActSelector,
  player: AbstractActor, aliveEnemies: AbstractActor[],
): Promise<'ATTACK' | 'BATTLE_LOSE' | 'BACK'> => {
  const actions: BattleAtcWithEnemy[] = aliveEnemies.map(
    (enemy, index) => ({
      text: TEMPLATES.attackEnemyAction.clone({ enemy }).value,
      type: `ATTACK_${index}`,
    }),
  );
  const currentActionType = await userActSelector.show(actions);

  if (currentActionType === 'BACK') return 'BACK';

  const enemy = aliveEnemies[Number(currentActionType.split('_')[1])];

  const attackResult = player.doAttack(enemy);

  await ui.sendToUser(TEMPLATES.attackMessage.clone({ attacker: player, attacked: enemy, attackResult }).value);

  for (const aliveEnemy of aliveEnemies) {
    if (!aliveEnemy.isAlive) await ui.sendToUser(`${aliveEnemy.getDeathMessage()}.`);
    return 'BATTLE_LOSE';
  }

  return 'ATTACK';
};

const examine = async (
  ui: AbstractUI, userActSelector: BattleUserActSelector,
  player: AbstractActor, aliveEnemies: AbstractActor[],
): Promise<'EXAMINE' | 'BATTLE_LOSE' | 'BACK'> => {
  const actions: BattleAtcWithEnemy[] = aliveEnemies.map(
    (enemy, index) => ({
      text: TEMPLATES.examineEnemyAction.clone({ enemy }).value,
      type: `EXAMINE_${index}`,
    }),
  );
  const currentActionType = await userActSelector.show(actions);

  if (currentActionType === 'BACK') return 'BACK';

  const enemy = aliveEnemies[Number(currentActionType.split('_')[1])];

  const enemyStats = enemy.stats;

  await ui.sendToUser(TEMPLATES.examineEnemyFirstMessage.clone({ player, enemy }).value);
  await ui.sendToUser(TEMPLATES.examineEnemyCharacteristicsMessage.clone({ stats: enemyStats }).value);

  return 'EXAMINE';
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

  private _actSelector: BattleUserActSelector;

  private get battleFinished(): boolean {
    return this._aliveEnemies.length === 0 || !this._player.isAlive;
  }

  constructor(options: BattleOptions) {
    this._ui = options.ui;
    this._player = options.player;
    this._enemies = options.enemies;
    this._aliveEnemies = this._enemies.filter((enemy) => enemy.isAlive);
    const actSelector = this._ui.getUserActSelector('BATTLE');
    if (actSelector instanceof BattleUserActSelector) this._actSelector = actSelector;
    else throw new Error('Invalid userActSelector');
  }

  public async activate(): Promise<'BATTLE_WIN' | 'BATTLE_LOSE' | 'BATTLE_LEAVE'> {
    if (!this.battleFinished) {
      await this._ui.sendToUser(
        TEMPLATES.firstMessage.clone({ attacker: this._player, attacked: this._enemies }).value,
      );
    }

    let currentActionType: ActionBattleSubtypes = 'BATTLE_START';

    while (!this.battleFinished) {
      if (currentActionType === 'BATTLE_START') {
        currentActionType = await this._actSelector.show();
      }

      switch (currentActionType) {
        case 'BATTLE_LEAVE': return 'BATTLE_LEAVE';
        case 'BATTLE_LOSE': return 'BATTLE_LOSE';
        case 'ATTACK': {
          currentActionType = await attack(this._ui, this._actSelector, this._player, this._aliveEnemies);
          break;
        }
        case 'EXAMINE': {
          currentActionType = await examine(this._ui, this._actSelector, this._player, this._aliveEnemies);
          break;
        }
        case 'BACK': {
          continue;
        }
        default: {
          throw new Error('Incorrect ACTION_TYPE');
        }
      }

      this._aliveEnemies = this._enemies.filter((enemy) => enemy.isAlive);

      await enemiesAttack(this._ui, this._player, this._aliveEnemies);

      await this._ui.sendToUser(
        TEMPLATES.roundResultMessage.clone({ player: this._player, aliveEnemies: this._aliveEnemies }).value,
      );

      if (!this._player.isAlive) return 'BATTLE_LOSE';
    }

    await lootRewards(this._ui, this._player, this._enemies);

    return 'BATTLE_WIN';
  }
}
