import Handlebars from 'handlebars';

export type TemplateDelegate<TContext> = Handlebars.TemplateDelegate<TContext>;

// Define helpers
Handlebars.registerHelper('actorType', (actor, options) => actor.getType(options.hash));

Handlebars.registerHelper(
  'get',
  <TKey extends string | number>(target: Record<TKey, any>, key: TKey) => Reflect.get(target, key),
);

Handlebars.registerHelper('trueIndex', (index: number) => (index + 1).toString());

// Define Handlebars config
const handlebarsOptions = <const>{
  noEscape: true,
  strict: true,
};

export const compile = (template: string): TemplateDelegate<any> => Handlebars.compile(template, handlebarsOptions);

export const parse = (template: string, context: any): string => (
  Handlebars.compile(template, handlebarsOptions)(context)
);
