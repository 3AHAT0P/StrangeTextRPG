/* eslint-disable no-await-in-loop */
export type Listener<TContext> = (context: TContext) => Promise<void> | void;

export type MatcherFn<TEvent extends string> = (event: TEvent) => TEvent | null;

export class Matcher<
  TEvent extends string, TAdditionalEvent extends string = 'DEFAULT', TContext = any,
> {
  private _listeners: Map<TEvent | TAdditionalEvent, Listener<TContext>[]> = new Map();

  private _customMatchers: MatcherFn<TEvent | TAdditionalEvent>[] = [];

  private async _trigger(subtype: TEvent | TAdditionalEvent, context: TContext): Promise<void> {
    const listeners = this._listeners.get(subtype);
    if (listeners != null && listeners.length > 0) {
      for (const listener of listeners) await listener(context);
    }
  }

  public addMatcher(cb: MatcherFn<TEvent | TAdditionalEvent>): this {
    this._customMatchers.push(cb);
    return this;
  }

  public on(event: TEvent | TAdditionalEvent, cb: Listener<TContext>): this {
    const listeners = this._listeners.get(event);
    if (listeners == null) this._listeners.set(event, [cb]);
    else listeners.push(cb);
    return this;
  }

  public async run(event: TEvent, context: TContext): Promise<void> {
    for (const matcher of this._customMatchers) {
      const _event = matcher(event);
      if (_event !== null) await this._trigger(_event, context);
    }
    await this._trigger(event, context);
  }
}
