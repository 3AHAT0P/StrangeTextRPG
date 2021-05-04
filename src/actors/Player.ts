import { capitalise } from "../utils/capitalise";
import { isPresent } from "../utils/check";

import { AbstractActor, AbstractActorOptions, RewardBag, TypeByDeclensionOfNounOptions } from "./AbstractActor";
import { HeadArmor, NeckArmor, BodyArmor, HandsArmor, FingersArmor, LegsArmor, FeetArmor, CanvasCoatBodyArmor, CanvasTrousersLegsArmor } from "./armor";
import { FistWeapon, KnifeWeapon, Weapon } from "./weapon";

export const PlayerDeclensionOfNouns = {
  nominative: 'ты',
  genitive: 'тебя',
  dative: 'тебе',
  accusative: 'тебя',
  ablative: 'тобой',
  prepositional: 'о тебе',

  possessive: 'твои',
}

interface PeopleEquipmentSlots {
  head?: HeadArmor; // Helmet, Hood, Hat
  neck?: NeckArmor; // Neckle
  body?: BodyArmor; // Chests, cuirass, jacket, coat
  hands?: HandsArmor; // Gloves, Gauntlets
  fingers?: FingersArmor; // Ring
  leftHand?: Weapon; // Shield
  rightHand: Weapon; // Knife, sword, ...
  legs?: LegsArmor; // trousers
  feet?: FeetArmor; // Boots, sabatons
}

export class Player extends AbstractActor {
  type = 'player';

  get armor(): number {
    return  0 +
      + (this._wearingEquipment.head?.armor ?? 0)
      + (this._wearingEquipment.body?.armor ?? 0)
      + (this._wearingEquipment.hands?.armor ?? 0)
      + (this._wearingEquipment.legs?.armor ?? 0)
      + (this._wearingEquipment.feet?.armor ?? 0);
  }
  get attackDamage(): number { return this._wearingEquipment.rightHand?.attackDamage ?? 0; }
  get criticalChance(): number { return this._wearingEquipment.rightHand?.criticalChance ?? 0; }
  get criticalDamageModifier(): number { return this._wearingEquipment.rightHand?.criticalDamageModifier ?? 0; }
  get accuracy(): number { return this._wearingEquipment.rightHand?.accuracy ?? 0; }

  _wearingEquipment: PeopleEquipmentSlots = {
    body: new CanvasCoatBodyArmor(),
    rightHand: new FistWeapon(),
    legs: new CanvasTrousersLegsArmor(),
  };

  public get wearingEquipment() { return this._wearingEquipment; }

  constructor(options: AbstractActorOptions = {}) {
    super(options);

    this.maxHealthPoints = 10;
    this.healthPoints = 80;
  }

  public getType({ declension, capitalised = false }: TypeByDeclensionOfNounOptions): string {
    if (capitalised) return capitalise(PlayerDeclensionOfNouns[declension]);

    return PlayerDeclensionOfNouns[declension];
  }

  public getDeathMessage(): string {
    return `${this.getType({ declension: 'nominative', capitalised: true })} умер!`;
  }

  public collectReward(reward: RewardBag): void {
    if (isPresent<number>(reward.gold)) this._gold += reward.gold;
  }

  public equipWeapon(weapon: Weapon, hand: 'LEFT' | 'RIGHT' = 'RIGHT'): boolean {
    if (hand === 'LEFT') this._wearingEquipment.leftHand = weapon;
    else this._wearingEquipment.rightHand = weapon;

    return true;
  }
}
