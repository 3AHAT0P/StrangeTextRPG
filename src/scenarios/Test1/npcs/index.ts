import { AbstractNPC } from '@actors/AbstractNPC';

import { Merchant1, merchant1Id } from './1';

export class NPCManager {
  private static _classMap = <const>{
    [merchant1Id]: Merchant1,
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
