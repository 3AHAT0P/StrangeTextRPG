import { AbstractActor, AttackResult } from '@actors/AbstractActor';
import Handlebars from 'handlebars';

export type TemplateDelegate<TContext> = Handlebars.TemplateDelegate<TContext>;

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
  'updateEventState',
  (eventId: number, value: number, ctx: any) => {
    Reflect.get(ctx.data.root.events, eventId).updateState(value);
    return true;
  },
);

Handlebars.registerHelper(
  'eventStateIsEQ',
  (eventId: number, value: number, ctx: any) => Reflect.get(ctx.data.root.events, eventId).state === value,
);

Handlebars.registerHelper(
  'updateBattleImmune',
  (battleId: string, value: number, ctx: any) => {
    const oldValue = Number(Reflect.get(ctx.data.root.battles, battleId));
    const newValue = Number.isNaN(oldValue) ? value : oldValue + value;
    Reflect.set(
      ctx.data.root.battles,
      battleId,
      newValue > 0 ? newValue : 0,
    );
    return true;
  },
);

Handlebars.registerHelper(
  'canBattleTrigger',
  (battleId: string, chance: number, ctx: any) => {
    const rawValue = Number(Reflect.get(ctx.data.root.battles, battleId));
    const value = Number.isNaN(rawValue) ? 0 : rawValue;
    if (value !== 0) {
      Reflect.set(
        ctx.data.root.battles,
        battleId,
        value - 1,
      );
      return false;
    }
    return chance > Math.random();
  },
);

Handlebars.registerHelper(
  'loadMerchantInfo',
  (merchantId: number, ctx: any) => {
    ctx.data.root.loadMerchantGoods(merchantId);
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
