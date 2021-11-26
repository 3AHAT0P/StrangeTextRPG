type dependentPipeFn<T extends (a: any) => any> = (a: ReturnType<T>) => any;

export interface pipeFn {
  <
    A extends (a: any) => any,
    B extends dependentPipeFn<A>,
    >(
    a: A,
    b: B,
  ): (arg: Parameters<A>[0]) => ReturnType<B>;

  <
    A extends (a: any) => any,
    B extends dependentPipeFn<A>,
    C extends dependentPipeFn<B>,
    >(
    a: A,
    b: B,
    c: C,
  ): (arg: Parameters<A>[0]) => ReturnType<C>;
  <
    A extends (a: any) => any,
    B extends dependentPipeFn<A>,
    C extends dependentPipeFn<B>,
    D extends dependentPipeFn<C>,
    >(
    a: A,
    b: B,
    c: C,
    d: D,
  ): (arg: Parameters<A>[0]) => ReturnType<D>;
}
