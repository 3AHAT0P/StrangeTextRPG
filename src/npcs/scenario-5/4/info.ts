import { NPCInfo } from '@npcs/@types';

export const npc4Info: NPCInfo = <const>{
  id: 'Scenario:5|NPC:4',
  subtype: 'MERCHANT',
  name: 'Джессаиль',
  declensionOfNouns: <const>{
    nominative: 'Джессаиль',
    genitive: 'Джессаиля',
    dative: 'Джессаилю',
    accusative: 'Джессаиля',
    ablative: 'Джессаилем',
    prepositional: 'о Джессаиле',

    possessive: 'Джессаиля',
  },
};

export const poitionExchangeCondition = <const>{
  itemType: 'MISC',
  className: 'RatTail',
  count: 5,
};
