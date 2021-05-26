import { WideMap } from '@utils/WideMap';

/*
  - - недостижимое место
  w - wall, стена, нет прохода
  b - break, обрыв, нет прохода
  0 - пустая клетка
  1, 2, ... - сложность боя
  m - merchant, торговец
  p - player, игрок
  o - out, выход
  g - gold, немного золота (1-5)
  G - GOLD, много золота (10-20)
      N
  W - X - E
      S
*/

export type POIName =
  |'UNREACHABLE' | 'WALL' | 'BREAK'
  | 'CLEAN' | 'UNKNOWN' | 'EXIT'
  | 'MERCHANT' | 'PLAYER'
  | 'GOLD' | 'BAG' | 'EVENT'
  | 'VERY_EASY_BATTLE' | 'EASY_BATTLE' | 'MEDIUM_BATTLE' | 'HARD_BATTLE' | 'VERY_HARD_BATTLE';
export type POIIcon =
  |'-' | 'w' | 'b'
  | '0' | '?' | 'o'
  | 'm' | 'p'
  | 'g' | 'B' | `E${number}`
  | '1' | '2' | '3' | '4' | '5';

type PointOfInterestColumns = [
  id: number, name: POIName, icon: POIIcon, sign: string,
];

export class PointOfInterestMap extends WideMap<PointOfInterestColumns> {
  protected _lastId: number = 0;

  protected iconSecondaryIndex: Map<POIIcon, PointOfInterestColumns> = new Map<POIIcon, PointOfInterestColumns>();

  protected nameSecondaryIndex: Map<POIName, PointOfInterestColumns> = new Map<POIName, PointOfInterestColumns>();

  public generateId(): number { this._lastId += 1; return this._lastId; }

  public addRecord(
    id: PointOfInterestColumns[0],
    name: PointOfInterestColumns[1],
    icon: PointOfInterestColumns[2],
    sign: PointOfInterestColumns[3],
  ): PointOfInterestColumns {
    const record = super.addRecord(id, name, icon, sign);
    this.iconSecondaryIndex.set(icon, record);
    this.nameSecondaryIndex.set(name, record);
    return record;
  }

  public deleteRecord(id: PointOfInterestColumns[0]): PointOfInterestColumns | null {
    const record = super.deleteRecord(id);
    if (record != null) {
      this.iconSecondaryIndex.delete(record[2]);
      this.nameSecondaryIndex.delete(record[1]);
    }
    return record;
  }

  public getRecordByIcon(icon: POIIcon): PointOfInterestColumns {
    const record = this.iconSecondaryIndex.get(icon);
    if (record == null) throw new Error(`Invalid "icon" ${icon}`);

    return record;
  }

  public getRecordByName(name: POIName): PointOfInterestColumns {
    const record = this.nameSecondaryIndex.get(name);
    if (record == null) throw new Error(`Invalid "name" ${name}`);

    return record;
  }
}

export const pointsOfInterest = new PointOfInterestMap();

pointsOfInterest.addRecord(pointsOfInterest.generateId(), 'UNREACHABLE', '-', '⬛️');
pointsOfInterest.addRecord(pointsOfInterest.generateId(), 'WALL', 'w', '🟫');
pointsOfInterest.addRecord(pointsOfInterest.generateId(), 'BREAK', 'b', '🟪');
pointsOfInterest.addRecord(pointsOfInterest.generateId(), 'CLEAN', '0', '⬜️');
pointsOfInterest.addRecord(pointsOfInterest.generateId(), 'MERCHANT', 'm', '🔵');
pointsOfInterest.addRecord(pointsOfInterest.generateId(), 'PLAYER', 'p', '🔹');
pointsOfInterest.addRecord(pointsOfInterest.generateId(), 'EXIT', 'o', '🟥');
pointsOfInterest.addRecord(pointsOfInterest.generateId(), 'GOLD', 'g', '💰');
pointsOfInterest.addRecord(pointsOfInterest.generateId(), 'UNKNOWN', '?', '❔');
pointsOfInterest.addRecord(pointsOfInterest.generateId(), 'VERY_EASY_BATTLE', '1', '1');
pointsOfInterest.addRecord(pointsOfInterest.generateId(), 'EASY_BATTLE', '2', '2');
pointsOfInterest.addRecord(pointsOfInterest.generateId(), 'MEDIUM_BATTLE', '3', '3');
pointsOfInterest.addRecord(pointsOfInterest.generateId(), 'HARD_BATTLE', '4', '4');
pointsOfInterest.addRecord(pointsOfInterest.generateId(), 'VERY_HARD_BATTLE', '5', '5');
pointsOfInterest.addRecord(pointsOfInterest.generateId(), 'BAG', 'B', '📦');
pointsOfInterest.addRecord(pointsOfInterest.generateId(), 'EVENT', 'E0', '❔');
