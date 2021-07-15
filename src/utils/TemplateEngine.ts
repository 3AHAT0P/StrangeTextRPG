import Handlebars from 'handlebars';

export type TemplateDelegate<TContext> = Handlebars.TemplateDelegate<TContext>;

const logWrapper = (cb: any) => (
  (...args: any[]) => {
    const res = cb(...args);
    console.log([...args], res);
    return res;
  });

// Define helpers
Handlebars.registerHelper('actorType', (actor, options) => actor.getType(options.hash));

Handlebars.registerHelper(
  'get',
  logWrapper(<TKey extends string | number>(target: Record<TKey, any>, key: TKey) => Reflect.get(target, key)),
);

Handlebars.registerHelper(
  'set',
  <TKey extends string | number>(target: Record<TKey, any>, key: TKey, value: any) => Reflect.set(target, key, value),
);

Handlebars.registerHelper('trueIndex', (index: number) => (index + 1).toString());

Handlebars.registerHelper('isLTE', logWrapper((leftOperand: any, rightOperand: any) => leftOperand <= rightOperand));
Handlebars.registerHelper('isGTE', logWrapper((leftOperand: any, rightOperand: any) => leftOperand >= rightOperand));
Handlebars.registerHelper('isEQ', logWrapper((leftOperand: any, rightOperand: any) => leftOperand === rightOperand));

Handlebars.registerHelper(
  'updateEventState',
  (eventId: number, value: number, ctx: any) => {
    Reflect.get(ctx.events, eventId).state = value;
    return true;
  },
);

Handlebars.registerHelper(
  'eventStateIsEQ',
  (eventId: number, value: number, ctx: any) => Reflect.get(ctx.events, eventId).state === value,
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
