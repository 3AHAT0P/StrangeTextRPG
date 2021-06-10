import { MapSpotSubtype } from '@db/entities/MapSpot';

export type UsedColor = '000000' | '261c1c' | '808080' | 'c0c0c0' | 'ffff8d' | 'd500f9' | 'ffffff' | '0000ff' | '008000'
| '00ffff' | '800080' | '77ff00' | '633636' | '854747' | 'a65959' | 'b87a7a' | 'c99c9c' | '6b2e2e' | '8f3d3d'
| 'b34d4d' | 'c27070' | 'd19494' | '732626' | '993333' | 'bf4040' | 'cc6666' | 'd98c8c' | '7a1f1f' | 'a32929'
| 'cc3333' | 'd65c5c' | 'e08585' | '821717' | 'ad1f1f' | 'd92626' | 'e05252' | 'e87d7d';

export class Palette {
  private static _spotTypeAndColorPairMap: Readonly<Array<Readonly<[MapSpotSubtype, UsedColor]>>> = [
    ['UNREACHABLE', '000000'],
    ['BREAK', '261c1c'],
    ['WALL', '808080'],
    ['HOUSE', 'c0c0c0'],
    ['HOUSE_DOOR', 'ffff8d'],

    ['EMPTY', 'ffffff'],

    ['GUARD', 'd500f9'],
    ['MERCHANT', '0000ff'],
    ['BANDIT_GUARD', '008000'],
    ['NPC', '00ffff'],
    ['QUEST_NPC', '800080'],

    ['LOCATION_EXIT', '77ff00'],

    ['BATTLE#VERY_EASY@HIGHER', '633636'],
    ['BATTLE#EASY@HIGHER', '6b2e2e'],
    ['BATTLE#MEDIUM@HIGHER', '732626'],
    ['BATTLE#HARD@HIGHER', '7a1f1f'],
    ['BATTLE#VERY_HARD@HIGHER', '821717'],

    ['BATTLE#VERY_EASY@HIGH', '854747'],
    ['BATTLE#EASY@HIGH', '8f3d3d'],
    ['BATTLE#MEDIUM@HIGH', '993333'],
    ['BATTLE#HARD@HIGH', 'a32929'],
    ['BATTLE#VERY_HARD@HIGH', 'ad1f1f'],

    ['BATTLE#VERY_EASY@MEDIUM', 'a65959'],
    ['BATTLE#EASY@MEDIUM', 'b34d4d'],
    ['BATTLE#MEDIUM@MEDIUM', 'bf4040'],
    ['BATTLE#HARD@MEDIUM', 'cc3333'],
    ['BATTLE#VERY_HARD@MEDIUM', 'd92626'],

    ['BATTLE#VERY_EASY@LOW', 'b87a7a'],
    ['BATTLE#EASY@LOW', 'c27070'],
    ['BATTLE#MEDIUM@LOW', 'cc6666'],
    ['BATTLE#HARD@LOW', 'd65c5c'],
    ['BATTLE#VERY_HARD@LOW', 'e05252'],

    ['BATTLE#VERY_EASY@LOWER', 'c99c9c'],
    ['BATTLE#EASY@LOWER', 'd19494'],
    ['BATTLE#MEDIUM@LOWER', 'd98c8c'],
    ['BATTLE#HARD@LOWER', 'e08585'],
    ['BATTLE#VERY_HARD@LOWER', 'e87d7d'],
  ];

  public static getSpotTypeByColor(color: string): MapSpotSubtype | null {
    const pair = this._spotTypeAndColorPairMap.find(([, _color]) => color === _color);
    if (pair == null) return null;
    return pair[0];
  }

  public static getColorBySpotType(spotType: MapSpotSubtype): UsedColor {
    const pair = this._spotTypeAndColorPairMap.find(([_spotType]) => spotType === _spotType);
    if (pair == null) throw new Error('Palette::getSpotTypeByColor Something went wrong');
    return pair[1];
  }

  public static colorRGBToHEX(r: number, g: number, b: number): string {
    return `${r.toString(16).padEnd(2, '0')}${g.toString(16).padEnd(2, '0')}${b.toString(16).padEnd(2, '0')}`;
  }
}
