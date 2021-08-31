import type { Constructor } from '@utils/@types/Constructor';

export type DIToken = string | symbol;

const DITokens: Map<DIToken, Constructor> = new Map();

const DIContainer: WeakMap<Constructor, any> = new WeakMap();

export const DIProducer = (token?: DIToken) => (target: Constructor): void => {
  if (token != null) DITokens.set(token, target);
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const DIConsumer = (target: Constructor): void => { };

export const DIProducerAndConsumer = (token?: DIToken) => (target: Constructor): void => {
  if (token != null) DITokens.set(token, target);
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const DIProvider = (target: Constructor): void => { };

export const DIFactory = <TTarget extends Constructor>(Target: TTarget): InstanceType<TTarget> => {
  const producers: Constructor[] = Reflect.getMetadata('design:paramtypes', Target) ?? [];
  const producerInstancies = producers.map((producer: Constructor) => {
    if (DIContainer.has(producer)) return DIContainer.get(producer);

    const producerInstance = DIFactory(producer);
    DIContainer.set(producer, producerInstance);

    return producerInstance;
  });

  const instance = new Target(...producerInstancies);
  return instance;
};

// @DIProducer()
// class C {
//   help() {
//     console.log('HEEEELP!');
//   }
// }

// @DIProducer()
// class A {
//   x: number = 42;

//   public get c() { return this._c; }

//   constructor(private _c: C) { }

//   printXPlusY(y: number): void {
//     console.log(this.x + y);
//   }
// }

// @DIConsumer
// class B {
//   public get a() { return this._a; }

//   constructor(private _a: A) {

//   }
// }

// const b = DIFactory<typeof B>(B);

// console.log(b);
// b.a.c.help();
