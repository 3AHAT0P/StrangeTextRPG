import { capitalise } from '@utils/capitalise';
import { isPresent } from '@utils/check';
import {
  HeadArmor,
  NeckArmor,
  BodyArmor,
  HandsArmor,
  FingersArmor,
  LegsArmor,
  FeetArmor,
  CanvasCoatBodyArmor,
  CanvasTrousersLegsArmor,
} from '@armor';
import { FistWeapon, KnifeWeapon, Weapon } from '@weapon';
import { Inventory } from '@actors/Inventory';

import {
  AbstractActor, AbstractActorOptions, RewardBag, TypeByDeclensionOfNounOptions,
} from './AbstractActor';

export const PlayerDeclensionOfNouns = {
  nominative: 'ты',
  genitive: 'тебя',
  dative: 'тебе',
  accusative: 'тебя',
  ablative: 'тобой',
  prepositional: 'о тебе',

  possessive: 'твои',
};

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
  public type = 'player';

  public inventory: Inventory<PeopleEquipmentSlots>;

  get armor(): number {
    const { wearingEquipment } = this.inventory;
    return (wearingEquipment.head?.armor ?? 0)
      + (wearingEquipment.body?.armor ?? 0)
      + (wearingEquipment.hands?.armor ?? 0)
      + (wearingEquipment.legs?.armor ?? 0)
      + (wearingEquipment.feet?.armor ?? 0);
  }

  get attackDamage(): number { return this.inventory.wearingEquipment.rightHand?.attackDamage ?? 0; }

  get criticalChance(): number { return this.inventory.wearingEquipment.rightHand?.criticalChance ?? 0; }

  get criticalDamageModifier(): number {
    return this.inventory.wearingEquipment.rightHand?.criticalDamageModifier ?? 0;
  }

  get accuracy(): number { return this.inventory.wearingEquipment.rightHand?.accuracy ?? 0; }

  public get wearingEquipment(): PeopleEquipmentSlots { return this.inventory.wearingEquipment; }

  constructor(options: AbstractActorOptions = {}) {
    super(options);

    this.maxHealthPoints = 10;
    this.healthPoints = 8;
    this.inventory = new Inventory<PeopleEquipmentSlots>({
      defaultEquipment: {
        body: new CanvasCoatBodyArmor(),
        // TODO set rightHand equal to a FistWeapon as it was before
        rightHand: new KnifeWeapon(),
        legs: new CanvasTrousersLegsArmor(),
      },
      gold: 100,
    });
  }

  public getType({ declension, capitalised = false }: TypeByDeclensionOfNounOptions): string {
    if (capitalised) return capitalise(PlayerDeclensionOfNouns[declension]);

    return PlayerDeclensionOfNouns[declension];
  }

  public getDeathMessage(): string {
    return `${this.getType({ declension: 'nominative', capitalised: true })} умер!`;
  }

  // TODO still needed or can be reduced to one method collectGold?
  public collectReward(reward: RewardBag): void {
    if (isPresent<number>(reward.gold)) this.inventory.collectGold(reward.gold);
  }

  public equipWeapon(weapon: Weapon, hand: 'LEFT' | 'RIGHT' = 'RIGHT'): boolean {
    if (hand === 'LEFT') this.inventory.wearingEquipment.leftHand = weapon;
    else this.inventory.wearingEquipment.rightHand = weapon;

    return true;
  }
}
