import { AbstractNPC } from '@actors/AbstractNPC';

import { Merchant1, merchant1Id } from './1';
import { Merchant2, merchant2Id } from './2';
import { Merchant3, merchant3Id } from './3';
import { Merchant4, merchant4Id } from './4';
import { Merchant5, merchant5Id } from './5';

export class NPCManager {
  private static _classMap = <const>{
    [merchant1Id]: Merchant1,
    [merchant2Id]: Merchant2,
    [merchant3Id]: Merchant3,
    [merchant4Id]: Merchant4,
    [merchant5Id]: Merchant5,
  };

  private _npcMap: Record<string, AbstractNPC> = {};

  public get(npcId: string): AbstractNPC {
    let npc = this._npcMap[npcId];
    if (npc != null) return npc;

    const NPCClass = NPCManager._classMap[npcId];
    if (NPCClass != null) {
      npc = new NPCClass();
      this._npcMap[npcId] = npc;
      return npc;
    }

    throw new Error(`NPC with id (${npcId}) not exists`);
  }
}
