import { NPCInfo } from '@npcs/@types';

export const npc1Info: NPCInfo = <const>{
  id: 'Scenario:5|NPC:1',
  subtype: 'MERCHANT',
  name: 'Олаф',
  declensionOfNouns: <const>{
    nominative: 'Олаф',
    genitive: 'Олафа',
    dative: 'Олафу',
    accusative: 'Олафа',
    ablative: 'Олафом',
    prepositional: 'об Олафе',

    possessive: 'Олафа',
  },
};

export const poitionExchangeCondition = <const>{
  itemType: 'MISC',
  className: 'RatTail',
  count: 5,
};
