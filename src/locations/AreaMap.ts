import { Armor } from '@armor';
import { Weapon } from '@weapon';
import { Point, Size } from '@utils/@types';

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

export type DIRECTION = 'NORTH' | 'SOUTH' | 'WEST' | 'EAST';
export type POIName = 'UNREACHABLE' | 'WALL' | 'BREAK'
| 'CLEAN' | 'UNKNOWN' | 'EXIT'
| 'MERCHANT' | 'PLAYER'
| 'GOLD' | 'BAG'
| 'VERY_EASY_BATTLE' | 'EASY_BATTLE' | 'MEDIUM_BATTLE' | 'HARD_BATTLE' | 'VERY_HARD_BATTLE';
export type POIIcon = '-' | 'w' | 'b'
| '0' | '?' | 'o'
| 'm' | 'p'
| 'g' | 'B'
| '1' | '2' | '3' | '4' | '5';

export const PointOfInterest: Readonly<Record<POIName, POIIcon>> = {
  UNREACHABLE: '-',
  WALL: 'w',
  BREAK: 'b',
  CLEAN: '0',
  MERCHANT: 'm',
  PLAYER: 'p',
  EXIT: 'o',
  GOLD: 'g',
  UNKNOWN: '?',
  VERY_EASY_BATTLE: '1',
  EASY_BATTLE: '2',
  MEDIUM_BATTLE: '3',
  HARD_BATTLE: '4',
  VERY_HARD_BATTLE: '5',
  BAG: 'B',
};

export const InversedPOI = (Object.entries(PointOfInterest) as Array<[POIName, POIIcon]>)
  .reduce((acc: Partial<Record<POIIcon, POIName>>, [key, value]) => {
    acc[value] = key;
    return acc;
  }, {}) as Readonly<Record<POIIcon, POIName>>;

export const mapSigns: Readonly<Record<POIName, string>> = {
  UNREACHABLE: '⬛️',
  WALL: '🟫',
  BREAK: '🟪',
  CLEAN: '⬜️',
  MERCHANT: '🔵',
  PLAYER: '🔹',
  EXIT: '🟥',
  GOLD: '💰',
  UNKNOWN: '❔',
  VERY_EASY_BATTLE: '1',
  EASY_BATTLE: '2',
  MEDIUM_BATTLE: '3',
  HARD_BATTLE: '4',
  VERY_HARD_BATTLE: '5',
  BAG: '📦',
};

export interface AdditionalBagSpotInfo {
  reward: typeof Weapon | typeof Armor;
}

export type AdditionalSpotInfo = AdditionalBagSpotInfo;

export interface MapSpot {
  coordinates: Point;
  type: POIName;
  icon: POIIcon;
  sign: string;
  isVisible: boolean;
  isThroughable: boolean;
  additionalInfo: AdditionalSpotInfo | null;
}

export type ambiancesType = {
  walls: number;
  enemies: number;
  breaks: number;
  npc: number;
};

export class AreaMap {
  private map: Map<string, MapSpot> = new Map<string, MapSpot>();

  private _playerPosition: Point = {
    x: -1,
    y: -1,
  };

  public get playerPosition(): Readonly<Point> { return { ...this._playerPosition }; }

  public get currentSpot(): MapSpot | undefined {
    return this.map.get(`${this.playerPosition.y}:${this.playerPosition.x}`);
  }

  private fillMap(map: POIIcon[], additionalInfo: Record<string, AdditionalSpotInfo>) {
    const throughableTypes = ['UNREACHABLE', 'WALL', 'BREAK'];
    for (let y = 0; y < this.mapSize.height; y += 1) {
      for (let x = 0; x <= this.mapSize.width + 1; x += 1) {
        const icon = map[y * this.mapSize.width + x];
        if (icon === PointOfInterest.PLAYER) {
          this._playerPosition = { x, y };
          this.map.set(`${y}:${x}`, {
            coordinates: { x, y },
            type: 'CLEAN',
            icon: PointOfInterest.CLEAN,
            sign: mapSigns.CLEAN,
            isVisible: true,
            isThroughable: true,
            additionalInfo: additionalInfo[`${y}:${x}`],
          });
        } else {
          const type = InversedPOI[icon];
          this.map.set(`${y}:${x}`, {
            coordinates: { x, y },
            type,
            icon,
            sign: mapSigns[type],
            isVisible: false,
            isThroughable: !throughableTypes.includes(type),
            additionalInfo: additionalInfo[`${y}:${x}`],
          });
        }
      }
    }
  }

  constructor(map: POIIcon[], private mapSize: Size, additionalInfo: Record<string, AdditionalSpotInfo>) {
    this.fillMap(map, additionalInfo);
  }

  public printLegend(): string {
    return ''
      + '⬛️ - недостижимое место\n'
      + '🟫 - wall, стена, нет прохода\n'
      + '🟪 - break, обрыв, нет прохода\n'
      + '⬜️ - чистое место\n'
      + '🔵 - merchant, торговец\n'
      + '🔹 - player, игрок\n'
      + '🟥 - out, выход\n'
      + '🔸 - gold, золото\n'
      + '❔ - не разведанная территория\n'
      + '⬆️ - N (Север)\n'
      + '➡️ - E (Восток)\n'
      + '⬇️ - S (Юг)\n'
      + '⬅️ - W (Запад)\n';
  }

  public printMap(WithLegend: boolean = true): string {
    let mapPiece = WithLegend ? `${this.printLegend()}\n` : '';
    for (let y = this.playerPosition.y - 1; y <= this.playerPosition.y + 1; y += 1) {
      if (y < 0 || y > this.mapSize.height - 1) continue;
      for (let x = this.playerPosition.x - 1; x <= this.playerPosition.x + 1; x += 1) {
        if (x < 0 || x > this.mapSize.width - 1) continue;
        const spot = this.map.get(`${y}:${x}`);
        if (spot != null) {
          if (y === this.playerPosition.y && x === this.playerPosition.x) mapPiece += '🔹';
          else if (!spot.isVisible) mapPiece += mapSigns.UNKNOWN;
          else mapPiece += spot.sign;
        }
      }
      mapPiece += '\n';
    }
    return mapPiece;
  }

  public canMove({ x, y }: Point): boolean {
    const destinationSpot = this.map.get(`${y}:${x}`);
    if (destinationSpot == null) return false;
    return destinationSpot.isThroughable;
  }

  public lookAround(): void {
    for (let y = this.playerPosition.y - 1; y <= this.playerPosition.y + 1; y += 1) {
      if (y < 0 || y > this.mapSize.height - 1) continue;
      for (let x = this.playerPosition.x - 1; x <= this.playerPosition.x + 1; x += 1) {
        if (x < 0 || x > this.mapSize.width - 1) continue;
        const spot = this.map.get(`${y}:${x}`);
        if (spot != null && !spot.isThroughable && !spot.isVisible) spot.isVisible = true;
      }
    }
  }

  public countAroundAmbiences(): ambiancesType {
    const result = {
      walls: 0,
      enemies: 0,
      breaks: 0,
      npc: 0,
    };
    for (let y = this.playerPosition.y - 1; y <= this.playerPosition.y + 1; y += 1) {
      if (y < 0 || y > this.mapSize.height - 1) { continue; }
      for (let x = this.playerPosition.x - 1; x <= this.playerPosition.x + 1; x += 1) {
        if (x < 0 || x > this.mapSize.width - 1) { continue; }
        const spot = this.map.get(`${y}:${x}`);
        if (spot != null) {
          switch (spot.type) {
            case 'BREAK':
              result.breaks += 1;
              break;
            case 'WALL':
              result.walls += 1;
              break;
            case 'MERCHANT':
              result.npc += 1;
              break;
            case 'VERY_EASY_BATTLE':
            case 'EASY_BATTLE':
            case 'MEDIUM_BATTLE':
            case 'HARD_BATTLE':
            case 'VERY_HARD_BATTLE':
              result.enemies += 1;
              break;
            default:
              break;
          }
        }
      }
    }
    return result;
  }

  public move(direction: DIRECTION, count: number = 1): boolean {
    if (direction === 'NORTH') {
      const destinationSpot = this.map.get(`${this.playerPosition.y - count}:${this.playerPosition.x}`);
      if (destinationSpot == null || !destinationSpot.isThroughable) return false;
      this._playerPosition.y -= count;
      destinationSpot.isVisible = true;
      return true;
    }
    if (direction === 'EAST') {
      const destinationSpot = this.map.get(`${this.playerPosition.y}:${this.playerPosition.x + count}`);
      if (destinationSpot == null || !destinationSpot.isThroughable) return false;
      this._playerPosition.x += count;
      destinationSpot.isVisible = true;
      return true;
    }
    if (direction === 'SOUTH') {
      const destinationSpot = this.map.get(`${this.playerPosition.y + count}:${this.playerPosition.x}`);
      if (destinationSpot == null || !destinationSpot.isThroughable) return false;
      this._playerPosition.y += count;
      destinationSpot.isVisible = true;
      return true;
    }
    if (direction === 'WEST') {
      const destinationSpot = this.map.get(`${this.playerPosition.y}:${this.playerPosition.x - count}`);
      if (destinationSpot == null || !destinationSpot.isThroughable) return false;
      this._playerPosition.x -= count;
      destinationSpot.isVisible = true;
      return true;
    }
    return false;
  }

  public updateSpot({ x, y }: Point, type: POIName): boolean {
    const spot = this.map.get(`${y}:${x}`);
    if (spot == null) return false;

    const throughableTypes = ['UNREACHABLE', 'WALL', 'BREAK'];

    spot.type = type;
    spot.icon = PointOfInterest[type];
    spot.sign = mapSigns[type];
    spot.isThroughable = !throughableTypes.includes(type);

    return true;
  }
}
