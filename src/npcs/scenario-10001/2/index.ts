import { AbstractActorOptions } from '@actors/AbstractActor';
import { AbstractNPC } from 'npcs/AbstractNPC';
import { UniqueOldFamilyRingArmor } from '@actors/armor';

import { npc2Info } from './info';

export class NPC2 extends AbstractNPC {
  protected readonly type = npc2Info.subtype;

  protected readonly _id = npc2Info.id;

  protected readonly declensionOfNouns = npc2Info.declensionOfNouns;

  protected readonly _maxHealthPoints = 17;

  public readonly name = npc2Info.name;

  constructor(options: AbstractActorOptions = {}) {
    super(options);
    this.inventory.collectGold(10);
    this.inventory.collectItem(new UniqueOldFamilyRingArmor());
  }
}
