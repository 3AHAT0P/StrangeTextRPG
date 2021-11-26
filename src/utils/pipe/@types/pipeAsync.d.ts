type dependentPipeFnAsync<T extends (a: any) => Promise<any>> = (a: Awaited<ReturnType<T>>) => Promise<any>;

export interface pipeAsyncFn {
  <
    A extends (a: any) => Promise<any>,
    B extends dependentPipeFnAsync<A>,
    >(
    a: A,
    b: B,
  ): (arg: Parameters<A>[0]) => Promise<ReturnType<B>>;

  <
    A extends (a: any) => Promise<any>,
    B extends dependentPipeFnAsync<A>,
    C extends dependentPipeFnAsync<B>,
    >(
    a: A,
    b: B,
    c: C,
  ): (arg: Parameters<A>[0]) => Promise<ReturnType<C>>;

  <
    A extends (a: any) => Promise<any>,
    B extends dependentPipeFnAsync<A>,
    C extends dependentPipeFnAsync<B>,
    D extends dependentPipeFnAsync<C>,
    >(
    a: A,
    b: B,
    c: C,
    d: D,
  ): (arg: Parameters<A>[0]) => Promise<ReturnType<D>>;
}
