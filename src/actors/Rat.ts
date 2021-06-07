import { capitalise } from '@utils/capitalise';
import { returnByChance } from '@utils/returnByChance';

import { Player } from '@actors/Player';
import {
  RatSkin, RatTail, StrangeFlute,
} from '@actors/miscellanious';
import {
  AbstractActor, AbstractActorOptions, AttackResult, TypeByDeclensionOfNounOptions,
} from './AbstractActor';
import { LeatherBodyArmor } from './armor';
import {
  EmptyWeapon, PawsWeapon, TeethWeapon,
} from './weapon';
import { AbstractItemContructor } from './AbstractItem';

export const RatDeclensionOfNouns = {
  nominative: 'крыса',
  genitive: 'крысы',
  dative: 'крысе',
  accusative: 'крысу',
  ablative: 'крысой',
  prepositional: 'о крысе',

  possessive: 'крысы',
};

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
  type = 'крыса';

  protected _activeWeapon: TeethWeapon | PawsWeapon | EmptyWeapon;

  protected possibleLoot: [rootMeta: RatLootMeta, chance: number][] = [
    [[RatSkin, 1, 1], 0.7],
    [[RatTail, 1, 1], 0.6],
    [[StrangeFlute, 1, 1], 0.05],
  ];

  get armor(): number { return this._wearingEquipment.body?.armor ?? 0; }

  get attackDamage(): number { return this._activeWeapon.attackDamage; }

  get criticalChance(): number { return this._activeWeapon.criticalChance; }

  get criticalDamageModifier(): number { return this._activeWeapon.criticalDamageModifier; }

  get accuracy(): number { return this._activeWeapon.accuracy; }

  _wearingEquipment: RatEquipmentSlots = {
    body: new LeatherBodyArmor(),
    jaws: new TeethWeapon(),
    hands: new PawsWeapon(),
  };

  constructor(options: AbstractActorOptions = {}) {
    super(options);

    this.maxHealthPoints = 5;
    this.healthPoints = 5;

    this._activeWeapon = this._wearingEquipment.jaws ?? new EmptyWeapon();
  }

  public doAttack(enemy: AbstractActor): AttackResult {
    this._activeWeapon = returnByChance<TeethWeapon | PawsWeapon | undefined>(
      [[this._wearingEquipment.hands, 0.5], [this._wearingEquipment.jaws, 1]],
    )[0] ?? new EmptyWeapon();

    return super.doAttack(enemy);
  }

  public getType(
    {
      declension, plural = false, withPostfix = false, capitalised = false,
    }: TypeByDeclensionOfNounOptions,
  ): string {
    let result = plural ? RatDeclensionOfNounsPlural[declension] : RatDeclensionOfNouns[declension];

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
      const lootMeta: RatLootMeta[] = returnByChance<RatLootMeta>(this.possibleLoot, false);
      if (lootMeta.length === 0) return 'Увы, но у вы не смогли ничего добыть из крысы.';

      const loot: RatLoot[] = [];

      for (const [constructor, ...amount] of lootMeta) loot.push(...constructor.create(amount));

      return `Вы получили: ${loot.map((item) => `${item.name} `).join(', ')}! Увы у вас дырявые карманцы и всё выпало по дороге.`;
    }
    return 'Увы, но у крысы нету карманов.';
  }
}
