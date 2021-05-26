import { Armor } from '@armor';
import { Weapon } from '@weapon';
import { Point, Size } from '@utils/@types';

import { POIName, POIIcon, pointsOfInterest } from './PointOfInterest';

export type DIRECTION = 'NORTH' | 'SOUTH' | 'WEST' | 'EAST';

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
      for (let x = 0; x < this.mapSize.width; x += 1) {
        const mapIcon = map[y * this.mapSize.width + x];
        if (mapIcon.startsWith('E')) {
          const [, type, , sign] = pointsOfInterest.getRecordByName('EVENT');
          this.map.set(`${y}:${x}`, {
            coordinates: { x, y },
            type,
            icon: mapIcon,
            sign,
            isVisible: false,
            isThroughable: !throughableTypes.includes(type),
            additionalInfo: additionalInfo[`${y}:${x}`],
          });
        } else if (mapIcon === 'p') {
          const cleanPOI = pointsOfInterest.getRecordByName('CLEAN');
          this._playerPosition = { x, y };
          this.map.set(`${y}:${x}`, {
            coordinates: { x, y },
            type: cleanPOI[1],
            icon: cleanPOI[2],
            sign: cleanPOI[3],
            isVisible: true,
            isThroughable: true,
            additionalInfo: additionalInfo[`${y}:${x}`],
          });
        } else {
          const [, type, icon, sign] = pointsOfInterest.getRecordByIcon(mapIcon);
          this.map.set(`${y}:${x}`, {
            coordinates: { x, y },
            type,
            icon,
            sign,
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

  public printMap(): string {
    let mapPiece = '';
    for (let y = this.playerPosition.y - 1; y <= this.playerPosition.y + 1; y += 1) {
      if (y < 0 || y > this.mapSize.height - 1) continue;
      for (let x = this.playerPosition.x - 1; x <= this.playerPosition.x + 1; x += 1) {
        if (x < 0 || x > this.mapSize.width - 1) continue;
        const spot = this.map.get(`${y}:${x}`);
        if (spot != null) {
          if (y === this.playerPosition.y && x === this.playerPosition.x) mapPiece += '🔹';
          else if (!spot.isVisible) mapPiece += pointsOfInterest.getRecordByName('UNKNOWN')[3];
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
    const [, , icon, sign] = pointsOfInterest.getRecordByName(type);
    spot.type = type;
    spot.icon = icon;
    spot.sign = sign;
    spot.isThroughable = !throughableTypes.includes(type);

    return true;
  }
}
