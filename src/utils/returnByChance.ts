export const returnByChance = <T extends unknown>(items: Array<[T, number]>, onlyOne: boolean = true): T[] => {
  const result: T[] = [];
  for (const [item, chance] of items) {
    const rnd = Math.random();
    console.log(rnd, chance, rnd <= chance)
    if (rnd <= chance) {
      result.push(item);
      if (onlyOne) break;
    }
  }
  return result;
};
