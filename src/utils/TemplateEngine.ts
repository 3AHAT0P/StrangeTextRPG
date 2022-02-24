/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { AbstractActor, AttackResult } from '@actors/AbstractActor';
import { AbstractItem } from '@actors/AbstractItem';
import { BattleInfo } from '@scenarios/@types';
import Handlebars from 'handlebars';

export type TemplateDelegate<TContext> = Handlebars.TemplateDelegate<TContext>;

const logDecorator = (cb: any, name: string = 'DEFAULT') => (...args: any[]) => {
  console.log(name, ...args);
  return cb(...args);
};

// Define helpers
Handlebars.registerHelper('actorType', (actor, ctx: any) => actor.getType(ctx.hash));

Handlebars.registerHelper(
  'get',
  <TKey extends string | number>(target: Record<TKey, any>, key: TKey) => Reflect.get(target, key),
);

Handlebars.registerHelper(
  'set',
  <TKey extends string | number>(target: Record<TKey, any>, key: TKey, value: any) => Reflect.set(target, key, value),
);

Handlebars.registerHelper('trueIndex', (index: number) => (index + 1).toString());

Handlebars.registerHelper('isLTE', (leftOperand: any, rightOperand: any) => leftOperand <= rightOperand);
Handlebars.registerHelper('isGTE', (leftOperand: any, rightOperand: any) => leftOperand >= rightOperand);
Handlebars.registerHelper('isEQ', (leftOperand: any, rightOperand: any) => leftOperand === rightOperand);

Handlebars.registerHelper(
  'updateQuestState',
  (questId: string, value: number, ctx: any) => {
    Reflect.get(ctx.data, 'root').getQuest(questId).updateState(value);
    return true;
  },
);

Handlebars.registerHelper(
  'questStateIsEQ',
  (questId: string, value: number, ctx: any) => Reflect.get(ctx.data, 'root').getQuest(questId).state === value,
);

Handlebars.registerHelper(
  'inventory_dropItemById',
  (target: AbstractActor, item: AbstractItem) => target.inventory.dropItem(item),
);

Handlebars.registerHelper(
  'inventory_findItemByClassName',
  (
    target: AbstractActor,
    type: 'ARMOR' | 'WEAPON' | 'POTION' | 'MISC',
    className: string,
  ) => target.inventory.getItemsByClassName(type, className),
);

Handlebars.registerHelper(
  'inventory_getItemsNumberByClassName',
  (
    target: AbstractActor,
    type: 'ARMOR' | 'WEAPON' | 'POTION' | 'MISC',
    className: string,
  ) => target.inventory.getItemsByClassName(type, className).length,
);

Handlebars.registerHelper(
  'call',
  (
    target: any,
    key: string,
    ...args: any[]
  ) => {
    const ctx = args.pop();
    return target[key](...args);
  },
);

Handlebars.registerHelper(
  'battle_updateImmune',
  (battleId: string, value: number, ctx: any) => {
    const battleInfo: BattleInfo = Reflect.get(ctx.data.root.battles, battleId);
    if (battleInfo == null) throw new Error('BattleInfo is not defined');

    battleInfo.immune = battleInfo.immune + value > 0 ? battleInfo.immune + value : 0;
    return true;
  },
);

Handlebars.registerHelper(
  'battle_canTrigger',
  (battleId: string, chance: number, ctx: any) => {
    const battleInfo: BattleInfo | null = Reflect.get(ctx.data.root.battles, battleId);

    if (battleInfo == null) return chance > Math.random();

    if (battleInfo.immune === 0) return chance > Math.random();

    battleInfo.immune -= 1;
    return false;
  },
);

Handlebars.registerHelper(
  'battle_load',
  (battleId: string, difficult: BattleInfo['difficult'], ctx: any) => {
    let battleInfo: BattleInfo | null = Reflect.get(ctx.data.root.battles, battleId);
    if (battleInfo == null) {
      battleInfo = { id: battleId, immune: 0, difficult };
      Reflect.set(ctx.data.root.battles, battleId, battleInfo);
    }

    Reflect.set(ctx.data.root.battles, '__CURRENT__', battleInfo);
    return true;
  },
);

Handlebars.registerHelper(
  'battle_unload',
  (ctx: any) => {
    Reflect.set(ctx.data.root.battles, '__CURRENT__', null);
    return true;
  },
);

Handlebars.registerHelper(
  'loadMerchantInfo',
  (merchantId: string, ctx: any) => {
    ctx.data.root.loadMerchantInfo(merchantId);
    return true;
  },
);

Handlebars.registerHelper(
  'unloadCurrentMerchant',
  (ctx: any) => {
    ctx.data.root.unloadCurrentMerchant();
    return true;
  },
);

Handlebars.registerHelper(
  'loadNPCInfo',
  (npcId: string, ctx: any) => {
    ctx.data.root.loadNPCInfo(npcId);
    return true;
  },
);

Handlebars.registerHelper(
  'unloadCurrentNPCInfo',
  (ctx: any) => {
    ctx.data.root.unloadCurrentNPCInfo();
    return true;
  },
);

Handlebars.registerHelper(
  'showDamage',
  (attackResult: AttackResult) => {
    let result = String(attackResult.damage);
    if (attackResult.isCritical) result += ' ‼️КРИТ';
    if (attackResult.isMiss) result += ' ⚠️Промах';
    return result;
  },
);

Handlebars.registerHelper(
  'showActorHealthPoints',
  (actor: AbstractActor) => actor.stats.healthPoints,
);

// Define Handlebars config
const handlebarsOptions = <const>{
  noEscape: true,
  strict: true,
};

export const compile = (template: string): TemplateDelegate<any> => Handlebars.compile(template, handlebarsOptions);

export const parse = (template: string, context: any): string => (
  Handlebars.compile(template, handlebarsOptions)(context)
);
