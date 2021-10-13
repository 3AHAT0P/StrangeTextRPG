import { AbstractNPC, NPCId } from '../AbstractNPC';
import { AbstractNPCManager } from '../AbstractNPCManager';

import { NPC1, npc1Id } from './1';
import { NPC2, npc2Id } from './2';

export class NPCManager extends AbstractNPCManager {
  protected _classMap: Readonly<Record<NPCId, typeof AbstractNPC>> = <const>{
    [npc1Id]: NPC1,
    [npc2Id]: NPC2,
  };
}
