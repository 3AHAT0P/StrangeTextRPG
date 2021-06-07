// @RULE: For real chance, we should sort from low chance to higher
export const returnByChance = <T extends unknown>(items: Array<[T, number]>, onlyOne: boolean = true): T[] => {
  const result: T[] = [];
  for (const [item, chance] of items) {
    if (Math.random() <= chance) {
      result.push(item);
      if (onlyOne) break;
    }
  }
  return result;
};
