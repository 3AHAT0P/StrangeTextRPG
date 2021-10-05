// Максимум и минимум включаются
export const getRandomIntInclusive = (min: number, max: number): number => {
  const _min = Math.ceil(min);
  const _max = Math.floor(max);
  return Math.floor(Math.random() * (_max - _min + 1)) + _min;
};

// Максимум и минимум включаются
export const getRandomFloatInclusive = (min: number, max: number, precision: number = 2): number => {
  const precisionModificator = 10 ** precision;
  const range = max - min + 1 / precisionModificator;
  return Math.trunc((Math.random() * range + min) * precisionModificator) / precisionModificator;
};
