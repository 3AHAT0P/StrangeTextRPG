export interface Constructor<T = any> {
  new(...args: any[]): T;
  prototype: T;
}
