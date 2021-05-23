export abstract class WideMap<TColumns extends any[], TId = TColumns[0]> {
  protected primaryIndex: Map<TId, TColumns> = new Map<TId, TColumns>();

  protected data: Array<TColumns> = [];

  public get size(): number { return this.data.length; }

  public abstract generateId(): TId;

  public addRecord(...columns: TColumns): TColumns {
    this.data.push(columns);
    this.primaryIndex.set(columns[0], columns);
    return columns;
  }

  public getById(id: TId): TColumns | null {
    return this.primaryIndex.get(id) ?? null;
  }

  public getList(predicate?: (record: TColumns) => boolean): TColumns[] {
    if (predicate instanceof Function) {
      return this.data.filter(predicate);
    }

    return this.data;
  }

  public deleteRecord(id: TId): TColumns | null {
    const record = this.primaryIndex.get(id);
    if (record == null) return null;

    const index = this.data.findIndex(([_id]) => _id === id);
    this.data.splice(index, 1);
    this.primaryIndex.delete(id);

    return record;
  }
}
