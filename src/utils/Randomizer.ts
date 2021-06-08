export class Randomizer {
  /**
   * @param items - is array of elements with drop chances. Sum of chances must be equal to 1
   * @returns One element from this list.
   */
  static returnOneFromList<T extends unknown>(items: Array<[T, number]>): T {
    const sum = items.map(([, chance]) => chance).reduce((acc, item) => acc + item, 0);
    if (Math.round(sum) !== 1) throw new Error('Randomizer::returnOneFromList Input data incorrect! Sum of chance not equal 1');

    const randomValue = Math.random();
    let rightEdge = 0;
    for (const [item, chance] of items) {
      rightEdge += chance;
      if (randomValue <= rightEdge) return item;
    }

    throw new Error('Randomizer::returnOneFromList Something went wrong!');
  }

  /**
   * @param items - is array of elements with drop chances. Sum of chances can be any number
   * @returns Sublist of elements, which got chance.
   */
  static returnSomeFromList<T extends unknown>(items: Array<[T, number]>): T[] {
    const result: T[] = [];
    for (const [item, chance] of items) {
      if (Math.random() <= chance) result.push(item);
    }
    return result;
  }
}
