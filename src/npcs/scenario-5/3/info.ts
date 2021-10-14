import { NPCInfo } from '@npcs/@types';

export const npc3Info: NPCInfo = <const>{
  id: 'Scenario:5|NPC:3',
  subtype: 'MERCHANT',
  name: 'Шеварра',
  declensionOfNouns: <const>{
    nominative: 'Шеварра',
    genitive: 'Шеварру',
    dative: 'Шеварре',
    accusative: 'Шеварру',
    ablative: 'Шеваррой',
    prepositional: 'о Шеварре',

    possessive: 'Шеварры',
  },
};

export const poitionExchangeCondition = <const>{
  itemType: 'MISC',
  className: 'RatTail',
  count: 5,
};
