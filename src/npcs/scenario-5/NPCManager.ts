import { AbstractNPCManager } from '../AbstractNPCManager';

import { NPC1 } from './1';
import { npc1Info } from './1/info';
import { NPC2 } from './2';
import { npc2Info } from './2/info';
import { NPC3 } from './3';
import { npc3Info } from './3/info';
import { NPC4 } from './4';
import { npc4Info } from './4/info';
import { NPC5 } from './5';
import { npc5Info } from './5/info';

export class NPCManager extends AbstractNPCManager {
  protected _classMap = <const>{
    [npc1Info.id]: NPC1,
    [npc2Info.id]: NPC2,
    [npc3Info.id]: NPC3,
    [npc4Info.id]: NPC4,
    [npc5Info.id]: NPC5,
  };
}
