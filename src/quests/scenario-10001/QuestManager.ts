import { AbstractQuestManager } from '../AbstractQuestManager';

import { Quest1 } from './1';
import { quest1Id } from './1/info';
import { Quest2 } from './2';
import { quest2Id } from './2/info';

export class QuestManager extends AbstractQuestManager {
  protected _classMap = <const>{
    [quest1Id]: Quest1,
    [quest2Id]: Quest2,
  };
}
