export const isEmpty = <T extends Array<unknown> | string>(
  value: T,
): boolean => value === '' || (Array.isArray(value) && value.length === 0);

export const isPresent = <T>(value: T | null | undefined): value is T => value !== null && value !== void 0;
