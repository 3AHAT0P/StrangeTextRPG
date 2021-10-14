import { NPCInfo } from '@npcs/@types';

export const npc2Info: NPCInfo = <const>{
  id: 'Scenario:5|NPC:2',
  subtype: 'MERCHANT',
  name: 'Сильда',
  declensionOfNouns: <const>{
    nominative: 'Сильда',
    genitive: 'Сильду',
    dative: 'Сильде',
    accusative: 'Сильду',
    ablative: 'Сильдой',
    prepositional: 'о Сильде',

    possessive: 'Сильды',
  },
};

export const poitionExchangeCondition = <const>{
  itemType: 'MISC',
  className: 'RatTail',
  count: 5,
};
