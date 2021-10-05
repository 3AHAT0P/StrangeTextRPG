import { capitalise } from '@utils/capitalise';
import { Randomizer } from '@utils/Randomizer';
import { Player } from '@actors/Player';
import { LeatherBodyArmor } from '@armor';
import {
  EmptyWeapon,
  PawsWeapon,
  TeethWeapon,
} from '@weapon';
import {
  RatSkin,
  RatTail,
  StrangeFlute,
} from '@actors/miscellaneous';
import { Inventory } from '@actors/Inventory';

import {
  AbstractActor,
  AbstractActorOptions,
  AttackResult,
  TypeByDeclensionOfNounOptions,
} from '../AbstractActor';
import { AbstractItem, AbstractItemContructor } from '../AbstractItem';

export const RatDeclensionOfNounsPlural = {
  nominative: 'крысы',
  genitive: 'крыс',
  dative: 'крысам',
  accusative: 'крыс',
  ablative: 'крысами',
  prepositional: 'о крысах',

  possessive: 'крыс',
};

interface RatEquipmentSlots {
  body?: LeatherBodyArmor; // Leather
  jaws?: TeethWeapon; // Teeth
  hands?: PawsWeapon; // Paws
}

export type RatLoot = RatSkin | RatTail | StrangeFlute;

export type RatLootMeta = [constructor: AbstractItemContructor<RatLoot>, minAmount: number, maxAmount: number];

export class Rat extends AbstractActor {
  protected type = 'крыса';

  protected declensionOfNouns = {
    nominative: 'крыса',
    genitive: 'крысы',
    dative: 'крысе',
    accusative: 'крысу',
    ablative: 'крысой',
    prepositional: 'о крысе',

    possessive: 'крысы',
  };

  public inventory: Inventory<keyof RatEquipmentSlots, RatEquipmentSlots>;

  protected _activeWeapon: TeethWeapon | PawsWeapon | EmptyWeapon;

  protected possibleLoot: [rootMeta: RatLootMeta, chance: number][] = [
    [[StrangeFlute, 1, 1], 0.05],
    [[RatTail, 1, 1], 0.6],
    [[RatSkin, 1, 1], 0.7],
  ];

  get armor(): number { return this.inventory.wearingEquipment.body?.armor ?? 0; }

  get attackDamage(): number { return this._activeWeapon.attackDamage; }

  get criticalChance(): number { return this._activeWeapon.criticalChance; }

  get criticalDamageModifier(): number { return this._activeWeapon.criticalDamageModifier; }

  get accuracy(): number { return this._activeWeapon.accuracy; }

  constructor(options: AbstractActorOptions = {}) {
    super(options);

    this.maxHealthPoints = 5;
    this.healthPoints = 5;

    this.inventory = new Inventory({
      defaultEquipment: {
        body: new LeatherBodyArmor(),
        jaws: new TeethWeapon(),
        hands: new PawsWeapon(),
      },
    });

    this._activeWeapon = this.inventory.wearingEquipment.jaws ?? new EmptyWeapon();
  }

  public doAttack(enemy: AbstractActor): AttackResult {
    this._activeWeapon = Randomizer.returnOneFromList<TeethWeapon | PawsWeapon | undefined>(
      [[this.inventory.wearingEquipment.hands, 0.5], [this.inventory.wearingEquipment.jaws, 0.5]],
    ) ?? new EmptyWeapon();

    return super.doAttack(enemy);
  }

  public getType(
    {
      declension, plural = false, withPostfix = false, capitalised = false,
    }: TypeByDeclensionOfNounOptions,
  ): string {
    let result = plural ? RatDeclensionOfNounsPlural[declension] : this.declensionOfNouns[declension];

    if (capitalised) result = capitalise(result);
    if (this.typePostfix !== '' && withPostfix) result = `${result} ${this.typePostfix}`;

    return `🐀 ${result}`;
  }

  public getDeathMessage(): string {
    return `${this.getType({ declension: 'nominative', withPostfix: true, capitalised: true })} сдохла, жалобно пища!`;
  }

  public getReward(player: Player): string {
    const holdWeapon = player.wearingEquipment.rightHand;
    if ('skinning' in holdWeapon?.professions) {
      const lootMeta: RatLootMeta[] = Randomizer.returnSomeFromList<RatLootMeta>(this.possibleLoot);
      if (lootMeta.length === 0) return 'Увы, но у вы не смогли ничего добыть из крысы.';

      const loot: RatLoot[] = [];

      for (const [constructor, ...amount] of lootMeta) loot.push(...constructor.create(amount));

      const rewards = loot.map((item: AbstractItem) => {
        player.inventory.collectItem(item);
        return item.name;
      });

      return `Вы получили: ${rewards.join(', ')}!`;
    }
    return 'Увы, но у крысы нету карманов.';
  }

  public equipWeapon(weapon: TeethWeapon | PawsWeapon): void {
    if (weapon instanceof TeethWeapon) this.inventory.equipToSlot('jaws', weapon);
    if (weapon instanceof PawsWeapon) this.inventory.equipToSlot('hands', weapon);
  }

  public equipArmor(armor: LeatherBodyArmor): void {
    if (armor instanceof LeatherBodyArmor) this.inventory.equipToSlot('body', armor);
  }
}
