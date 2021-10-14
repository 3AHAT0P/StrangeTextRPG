import { InteractionEntity } from '@db/entities';
import { QuestBuilderOptions } from '@quests/@types';

import { quest1Id, Quest1States } from './info';

export const quest1Seed = ({ spot, baseInfo, dataCollection }: QuestBuilderOptions): void => {
  const quest1Interaction = dataCollection.addContainer<InteractionEntity>('Interaction', {
    ...baseInfo,
    text: 'Внезапно, {{actorType player declension="nominative"}} спотыкаешься о труп крысы.',
  });

  dataCollection.addLink(spot, {
    ...baseInfo,
    to: quest1Interaction.entity.interactionId,
    text: '',
    condition: `{{questStateIsEQ "${quest1Id}" "${Quest1States.PRE_INITIAL}"}}`,
    type: 'AUTO',
    subtype: 'OTHER',
  });

  dataCollection.addLink(quest1Interaction, {
    ...baseInfo,
    to: spot.entity.interactionId,
    text: '',
    operation: `{{updateQuestState "${quest1Id}" "${Quest1States.INITIAL}"}}`,
    type: 'AUTO',
    subtype: 'OTHER',
  });

  const quest1LookupInteraction = dataCollection.addContainer<InteractionEntity>('Interaction', {
    ...baseInfo,
    text: 'Крыса, как крыса. Но в боку у нее торчит нож. О, теперь будет чем отбиваться от этих тварей!',
  });

  dataCollection.addLink(spot, {
    ...baseInfo,
    to: quest1LookupInteraction.entity.interactionId,
    text: '👀 Осмотреть труп',
    condition: `{{questStateIsEQ "${quest1Id}" "${Quest1States.INITIAL}"}}`,
    type: 'CUSTOM',
    subtype: 'OTHER',
    isPrintable: true,
  });

  dataCollection.addLink(quest1LookupInteraction, {
    ...baseInfo,
    to: spot.entity.interactionId,
    text: '',
    operation: `{{updateQuestState "${quest1Id}" "${Quest1States.FINISHED_GOOD}"}}`,
    type: 'AUTO',
    subtype: 'OTHER',
  });
};
