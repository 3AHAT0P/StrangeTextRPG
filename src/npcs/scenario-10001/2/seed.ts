import {
  InteractionEntity,
  NPCEntity,
} from '@db/entities';
import { NPCInteractBuilderOptions } from '@npcs/@types';

import { Quest1Phase1TakeItemClass, quest2Id, Quest2States } from '@quests/scenario-10001/2/info';

import { npc2Info } from './info';

export const npc2Seed = (options: NPCInteractBuilderOptions): void => {
  const {
    spot, baseInfo, dataCollection,
  } = options;

  const npc = dataCollection.addContainer<NPCEntity>(
    'NPC',
    {
      ...baseInfo,
      NPCId: npc2Info.id,
      subtype: npc2Info.subtype,
    },
  );

  dataCollection.addLink(spot, {
    ...baseInfo,
    to: spot.entity.interactionId,
    text: 'Неподалеку {{actorType player declension="nominative"}} замечаешь раненого незнакомца.',
    condition: `{{questStateIsEQ "${quest2Id}" "${Quest2States.PRE_INITIAL}"}}`,
    operation: `{{updateQuestState "${quest2Id}" "${Quest2States.INITIAL}"}}`,
    type: 'AUTO',
    subtype: 'OTHER',
    isPrintable: true,
  });

  dataCollection.addLink(spot, {
    ...baseInfo,
    to: npc.entity.interactionId,
    text: 'Поговорить с Незнакомцем',
    condition: `{{questStateIsEQ "${quest2Id}" "${Quest2States.INITIAL}"}}`,
    operation: `{{loadNPCInfo "${npc2Info.id}"}}`,
    type: 'CUSTOM',
    subtype: 'OTHER',
  });

  const i0 = options.dataCollection.addContainer<InteractionEntity>('Interaction', {
    ...baseInfo,
    text: `💬 [${npc2Info.name}]: Эй, Путник! Помоги мне...`,
  });

  options.dataCollection.addLink(npc, {
    ...baseInfo,
    to: i0.entity.interactionId,
    text: '',
    condition: `{{questStateIsEQ "${quest2Id}" "${Quest2States.INITIAL}"}}`,
    type: 'AUTO',
    subtype: 'OTHER',
  });

  const i1 = options.dataCollection.addContainer<InteractionEntity>('Interaction', {
    ...baseInfo,
    text: `💬 [${npc2Info.name}]: Проходя тут, я напаролся на большую крысу!\n`
      + 'У нас был тяжелый бой, и я ее убил\n'
      + 'Однако уйти из боя целым, у меня не вышло.\n'
      + 'Я тежело ранен, и мне нужна помощь.'
      + 'Принеси мне, пожалуйста, зелье лечения. Мне не у кого больше попросить.'
      + 'А я в долгу не останусь!',
  });

  options.dataCollection.addLink(i0, {
    ...baseInfo,
    to: i1.entity.interactionId,
    text: '💬 [{{actorType player declension="nominative" capitalised=true}}]: Привет, что случилось?',
    type: 'CUSTOM',
    subtype: 'START_QUEST',
  });

  options.dataCollection.addLink(i0, {
    ...baseInfo,
    to: spot.entity.interactionId,
    text: '💬 [{{actorType player declension="nominative" capitalised=true}}]: Отстань!',
    type: 'CUSTOM',
    subtype: 'TALK_TO_NPC',
  });

  options.dataCollection.addLink(i1, {
    ...baseInfo,
    to: spot.entity.interactionId,
    text: 'Хорошо, главное не умри пока я вернусь',
    operation: `{{updateQuestState "${quest2Id}" "${Quest2States.PHASE_1}"}} {{unloadCurrentNPCInfo}}`,
    type: 'CUSTOM',
    subtype: 'OTHER',
  });

  options.dataCollection.addLink(i1, {
    ...baseInfo,
    to: spot.entity.interactionId,
    text: 'Не, я не альтруист, другим помогать. Каждый сам за себя!',
    operation: `{{updateQuestState "${quest2Id}" "${Quest2States.FINISHED_BAD}"}} {{unloadCurrentNPCInfo}}`,
    type: 'CUSTOM',
    subtype: 'OTHER',
  });

  dataCollection.addLink(spot, {
    ...baseInfo,
    to: npc.entity.interactionId,
    text: 'Поговорить с Незнакомцем',
    condition: `{{questStateIsEQ "${quest2Id}" "${Quest2States.PHASE_1}"}}`,
    operation: `{{loadNPCInfo "${npc2Info.id}"}}`,
    type: 'CUSTOM',
    subtype: 'OTHER',
  });

  const i2 = options.dataCollection.addContainer<InteractionEntity>('Interaction', {
    ...baseInfo,
    text: `💬 [${npc2Info.name}]: Ну как, ты принес?`,
  });

  options.dataCollection.addLink(npc, {
    ...baseInfo,
    to: i2.entity.interactionId,
    text: '',
    condition: `{{questStateIsEQ "${quest2Id}" "${Quest2States.PHASE_1}"}}`,
    type: 'AUTO',
    subtype: 'OTHER',
  });

  const i3 = options.dataCollection.addContainer<InteractionEntity>('Interaction', {
    ...baseInfo,
    text: `💬 [${npc2Info.name}]: Вот спасибо!`,
  });

  options.dataCollection.addLink(i2, {
    ...baseInfo,
    to: i3.entity.interactionId,
    text: 'Вот держи! (Отдать 1 зелье лечения)',
    condition: `{{isGTE (inventory_getItemsNumberByClassName player "POTION" "${Quest1Phase1TakeItemClass.name}") 1}}`,
    operation: `{{updateQuestState "${quest2Id}" "${Quest2States.FINISHED_GOOD}"}}`,
    type: 'CUSTOM',
    subtype: 'OTHER',
    isPrintable: true,
  });

  options.dataCollection.addLink(i3, {
    ...baseInfo,
    to: spot.entity.interactionId,
    text: '',
    operation: '{{unloadCurrentNPCInfo}}',
    type: 'AUTO',
    subtype: 'OTHER',
  });

  options.dataCollection.addLink(i2, {
    ...baseInfo,
    to: spot.entity.interactionId,
    text: 'Нет еще',
    operation: '{{unloadCurrentNPCInfo}}',
    type: 'CUSTOM',
    subtype: 'OTHER',
    isPrintable: true,
  });
};
