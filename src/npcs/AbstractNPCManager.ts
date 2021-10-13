import { AbstractNPC, NPCId } from './AbstractNPC';

export abstract class AbstractNPCManager {
  protected abstract _classMap: Readonly<Record<NPCId, typeof AbstractNPC>>;

  protected _npcMap: Record<NPCId, AbstractNPC> = {};

  public get(npcId: NPCId): AbstractNPC {
    let npc = this._npcMap[npcId];
    if (npc != null) return npc;

    const NPCClass = this._classMap[npcId];
    if (NPCClass != null) {
      npc = new (NPCClass as any)();
      this._npcMap[npcId] = npc;
      return npc;
    }

    throw new Error(`NPC with id (${npcId}) not exists`);
  }
}
