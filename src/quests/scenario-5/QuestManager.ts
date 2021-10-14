import { AbstractQuestManager } from '../AbstractQuestManager';

import { Quest1 } from './1';
import { quest1Id } from './1/info';

export class QuestManager extends AbstractQuestManager {
  protected _classMap = <const>{
    [quest1Id]: Quest1,
  };
}
