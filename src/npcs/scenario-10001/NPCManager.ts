import { AbstractNPCManager } from '../AbstractNPCManager';

import { NPC1 } from './1';
import { npc1Info } from './1/info';
import { NPC2 } from './2';
import { npc2Info } from './2/info';

export class NPCManager extends AbstractNPCManager {
  protected _classMap = <const>{
    [npc1Info.id]: NPC1,
    [npc2Info.id]: NPC2,
  };
}
