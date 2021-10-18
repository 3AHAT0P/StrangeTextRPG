import {
  InteractionEntity,
  NPCEntity,
} from '@db/entities';
import { NPCInteractBuilderOptions } from '@npcs/@types';

import { npc3Info, poitionExchangeCondition } from './info';

export const npc3Seed = (options: NPCInteractBuilderOptions): void => {
  const {
    spot, baseInfo, dataCollection,
  } = options;

  const npc = dataCollection.addContainer<NPCEntity>(
    'NPC',
    {
      ...baseInfo,
      NPCId: npc3Info.id,
      subtype: npc3Info.subtype,
    },
  );

  dataCollection.addLink(spot, {
    ...baseInfo,
    to: npc.entity.interactionId,
    text: `💬 Поговорить с торговцем (${npc3Info.name})`,
    operation: `{{loadMerchantInfo "${npc3Info.id}"}}`,
    type: 'CUSTOM',
    subtype: 'TALK_TO_NPC',
  });

  const i0 = dataCollection.addContainer<InteractionEntity>('Interaction', {
    ...baseInfo,
    text: '💬 [{{actorType player declension="nominative" capitalised=true}}]: Привет!',
  });

  const i1 = dataCollection.addContainer<InteractionEntity>('Interaction', {
    ...baseInfo,
    text: `💬 [${npc3Info.name}]: Привет!`,
  });

  const i2 = dataCollection.addContainer<InteractionEntity>('Interaction', {
    ...baseInfo,
    text: `💬 [${npc3Info.name}]: Извини, за столь скудный выбор.\n`
      + '{{#each (get currentMerchant showcase) as | good |}}'
      + '{{trueIndex @index}}: {{good.name}} = {{good.price}} золотых (📀)\n'
      + '{{/each}}',
  });

  const i3 = dataCollection.addContainer<InteractionEntity>('Interaction', {
    ...baseInfo,
    text: `💬 [${npc3Info.name}]: Чего изволишь?`,
  });

  const i4 = dataCollection.addContainer<InteractionEntity>('Interaction', {
    ...baseInfo,
    text: `💬 [${npc3Info.name}]: К сожалению, у {{actorType player declension="genitive"}} не хватает золота.`,
  });

  const i5 = dataCollection.addContainer<InteractionEntity>('Interaction', {
    ...baseInfo,
    text: '⚙️ У {{actorType player declension="genitive"}} осталось {{get player "gold"}} золота (📀)',
  });

  const i6 = dataCollection.addContainer<InteractionEntity>('Interaction', {
    ...baseInfo,
    text: `💬 [${npc3Info.name}]: Приходи еще :)`,
  });

  const i7 = dataCollection.addContainer<InteractionEntity>('Interaction', {
    ...baseInfo,
    text: `💬 [${npc3Info.name}]: Хмм... Ладно, для тебя сделаю исключение.\n`
      + `Если принесешь мне ${poitionExchangeCondition.count} крысинных хвостов, я отдам тебе взамен 1 маленькое зелье лечения`,
  });

  const i8 = dataCollection.addContainer<InteractionEntity>('Interaction', {
    ...baseInfo,
    text: `💬 [${npc3Info.name}]: А, ты еще жив. Ну что ж, уговор дороже денег ;)`,
  });

  dataCollection.addLink(npc, {
    ...baseInfo,
    to: i0.entity.interactionId,
    text: '',
    type: 'AUTO',
    subtype: 'OTHER',
  });

  dataCollection.addLink(i0, {
    ...baseInfo,
    to: i1.entity.interactionId,
    text: '',
    type: 'AUTO',
    subtype: 'OTHER',
  });

  dataCollection.addLink(i1, {
    ...baseInfo,
    to: i2.entity.interactionId,
    text: '',
    type: 'AUTO',
    subtype: 'OTHER',
  });

  dataCollection.addLink(i2, {
    ...baseInfo,
    to: i3.entity.interactionId,
    text: '',
    type: 'AUTO',
    subtype: 'OTHER',
  });

  dataCollection.addLink(i3, {
    ...baseInfo,
    to: i4.entity.interactionId,
    text: '',
    type: 'SYSTEM',
    subtype: 'DEAL_FAILURE',
  });

  dataCollection.addLink(i3, {
    ...baseInfo,
    to: i5.entity.interactionId,
    text: '',
    type: 'SYSTEM',
    subtype: 'DEAL_SUCCESS',
  });

  dataCollection.addLink(i3, {
    ...baseInfo,
    to: i7.entity.interactionId,
    text: '💬 [{{actorType player declension="nominative" capitalised=true}}]: А можно как-то иначе получить зелье?',
    type: 'CUSTOM',
    subtype: 'OTHER',
    isPrintable: true,
  });

  dataCollection.addLink(i7, {
    ...baseInfo,
    to: i6.entity.interactionId,
    text: '💬 [{{actorType player declension="nominative" capitalised=true}}]: Окей, спасибо.',
    type: 'CUSTOM',
    subtype: 'OTHER',
    isPrintable: true,
  });

  dataCollection.addLink(i3, {
    ...baseInfo,
    to: i6.entity.interactionId,
    text: '💬 [{{actorType player declension="nominative" capitalised=true}}]: Ничего, спасибо!',
    type: 'CUSTOM',
    subtype: 'OTHER',
    isPrintable: true,
  });

  dataCollection.addLink(i3, {
    ...baseInfo,
    to: i8.entity.interactionId,
    text: '💬 [{{actorType player declension="nominative" capitalised=true}}]: Я принес, вот они.',
    condition: `{{isGTE (inventory_getItemsNumberByClassName player "${poitionExchangeCondition.itemType}" "${poitionExchangeCondition.className}") ${poitionExchangeCondition.count}}}`,
    type: 'CUSTOM',
    subtype: 'OTHER',
    isPrintable: true,
  });

  dataCollection.addLink(i8, {
    ...baseInfo,
    to: i6.entity.interactionId,
    text: '',
    operation: '{{call currentMerchant "exchangeTailsToHealingPoition" player}}',
    type: 'AUTO',
    subtype: 'OTHER',
  });

  dataCollection.addLink(i4, {
    ...baseInfo,
    to: i3.entity.interactionId,
    text: '',
    type: 'AUTO',
    subtype: 'OTHER',
  });

  dataCollection.addLink(i5, {
    ...baseInfo,
    to: i3.entity.interactionId,
    text: '',
    type: 'AUTO',
    subtype: 'OTHER',
  });

  dataCollection.addLink(i6, {
    ...baseInfo,
    to: spot.entity.interactionId,
    text: '',
    operation: '{{unloadCurrentMerchant}}',
    type: 'AUTO',
    subtype: 'OTHER',
  });
};
