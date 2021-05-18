interface ActionsLayoutOptions {
  columns?: number;
}

export class ActionsLayout<T extends string | [string, string] = string> {
  private _maxColumns: number = 2;

  private _flatList: T[] = [];

  private _grooupedByRows: T[][] = [];

  public get flatList(): T[] { return this._flatList; }

  public get grooupedByRows(): T[][] { return this._grooupedByRows; }

  public get rows(): number { return this._grooupedByRows.length; }

  public get columns(): number { return Math.max(...this._grooupedByRows.map((row) => row.length)); }

  constructor(options: ActionsLayoutOptions = {}) {
    if (options.columns != null) this._maxColumns = options.columns;
  }

  public addRow(...buttons: T[]): this {
    this._flatList.push(...buttons);
    while (buttons.length > 0) {
      this._grooupedByRows.push(buttons.splice(0, this._maxColumns));
    }
    return this;
  }
}
