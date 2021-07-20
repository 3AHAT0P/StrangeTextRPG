export const findBy = <TItem extends Record<string, any>, TKey extends keyof TItem, TValue = TItem[TKey]>(
  array: TItem[], key: TKey, value: TValue,
): TItem | null => array.find((item) => item[key] === value) ?? null;

export const mapBy = <TItem extends Record<string, any>, TKey extends keyof TItem>(
  array: TItem[], key: TKey,
): Array<TItem[TKey]> => array.map((item) => item[key]);

export const filterBy = <TItem extends Record<string, any>, TKey extends keyof TItem, TValue = TItem[TKey]>(
  array: TItem[], key: TKey, value: TValue,
): TItem[] => array.filter((item) => item[key] === value);
