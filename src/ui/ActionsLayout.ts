interface ActionsLayoutOptions {
  columns?: number;
}

export class ActionsLayout<T extends string> {
  private _maxColumns: number = 2;

  private _flatList: T[] = [];

  private _groupedByRows: T[][] = [];

  public get flatList(): T[] { return this._flatList; }

  public get groupedByRows(): T[][] { return this._groupedByRows; }

  public get rows(): number { return this._groupedByRows.length; }

  public get columns(): number { return Math.max(...this._groupedByRows.map((row) => row.length)); }

  constructor(options: ActionsLayoutOptions = {}) {
    if (options.columns != null) this._maxColumns = options.columns;
  }

  public clear(): this {
    this._flatList = [];
    this._groupedByRows = [];
    return this;
  }

  public addRow(...buttons: T[]): this {
    this._flatList.push(...buttons);
    while (buttons.length > 0) {
      this._groupedByRows.push(buttons.splice(0, this._maxColumns));
    }
    return this;
  }
}
