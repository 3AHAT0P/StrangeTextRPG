import { compile, TemplateDelegate } from './TemplateEngine';

export class Template {
  private _raw: string;

  private _ctx: any | null = null;

  private _compiled: TemplateDelegate<any>;

  private _result: string | null = null;

  public get value(): string {
    if (this._result != null) return this._result;

    return this._build();
  }

  private _build(): string {
    if (this._ctx == null) throw new Error('Context is null');
    this._result = this._compiled(this._ctx);

    return this._result;
  }

  constructor(raw: string) {
    this._raw = raw;
    this._compiled = compile(this._raw);
  }

  public useContext(ctx: any): this {
    if (this._ctx === ctx) return this;
    this._ctx = ctx;
    this._result = null;

    return this;
  }

  public isEqualToRaw(raw: string): boolean {
    return this._raw === raw;
  }

  public isEqualTo(value: string): boolean {
    return this.value === value;
  }

  public forceBuild(): void {
    this._build();
  }
}
