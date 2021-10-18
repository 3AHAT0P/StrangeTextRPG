import { NPCInfo } from '@npcs/@types';

export const npc5Info: NPCInfo = <const>{
  id: 'Scenario:5|NPC:5',
  subtype: 'MERCHANT',
  name: 'Золис',
  declensionOfNouns: <const>{
    nominative: 'Золис',
    genitive: 'Золиса',
    dative: 'Золису',
    accusative: 'Золиса',
    ablative: 'Золисом',
    prepositional: 'о Золисе',

    possessive: 'Золиса',
  },
};

export const poitionExchangeCondition = <const>{
  itemType: 'MISC',
  className: 'RatTail',
  count: 5,
};
