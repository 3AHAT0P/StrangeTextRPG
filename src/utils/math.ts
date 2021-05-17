export const round = (
  value: number, precision: number,
): number => Math.round(value * 10 ** precision) / 10 ** precision;
export const truncate = (
  value: number, precision: number,
): number => Math.trunc(value * 10 ** precision) / 10 ** precision;
