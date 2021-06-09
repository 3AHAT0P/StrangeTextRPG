import { MapSpotSubtype } from '@db/entities/MapSpot';

export type UsedColor = '000000' | '261c1c' | '808080' | 'c0c0c0' | 'ffff8d' | 'd500f9' | 'ffffff' | '0000ff' | '008000'
| '00ffff' | '800080' | '9c27b0' | '633636' | '854747' | 'a65959' | 'b87a7a' | 'c99c9c' | '6b2e2e' | '8f3d3d'
| 'b34d4d' | 'c27070' | 'd19494' | '732626' | '993333' | 'bf4040' | 'cc6666' | 'd98c8c' | '7a1f1f' | 'a32929'
| 'cc3333' | 'd65c5c' | 'e08585' | '821717' | 'ad1f1f' | 'd92626' | 'e05252' | 'e87d7d';

export class Palette {
  // _spotTypeAndColorPairMap: [MapSpotSubtype, UsedColor][] = <const>{
  private static _spotTypeAndColorPairMap: Readonly<Array<Readonly<[MapSpotSubtype, string]>>> = [
    ['WALL', '808080'],
    ['HOUSE', 'c0c0c0'],
    ['EMPTY', 'ffffff'],
    ['GUARD', 'f44336'],
    ['HOUSE_DOOR', 'ffff8d'],
    ['MERCHANT', '0000ff'],
    ['BANDIT_GUARD', '008000'],
    ['NPC', '00ffff'],
    ['QUEST_NPC', '800080'],
    ['BATTLE_VERY_EASY', 'ffaaaa'], // 633636
    ['BATTLE_EASY', 'ff8080'], // 6b2e2e
    ['BATTLE_MEDIUM', 'ff6060'], // 732626
    ['BATTLE_HARD', 'ff4040'], // 7a1f1f
    ['BATTLE_VERY_HARD', 'ff2020'], // 821717
  ];

  public static getSpotTypeByColor(color: string): MapSpotSubtype | null {
    const pair = this._spotTypeAndColorPairMap.find(([, _color]) => color === _color);
    if (pair == null) return null;
    return pair[0];
  }

  public static getColorBySpotType(spotType: MapSpotSubtype): UsedColor {
    const pair = this._spotTypeAndColorPairMap.find(([_spotType]) => spotType === _spotType);
    if (pair == null) throw new Error('Palette::getSpotTypeByColor Something went wrong');
    return pair[1] as UsedColor;
  }

  public static colorRGBToHEX(r: number, g: number, b: number): string {
    return `${r.toString(16).padEnd(2, '0')}${g.toString(16).padEnd(2, '0')}${b.toString(16).padEnd(2, '0')}`;
  }
}
