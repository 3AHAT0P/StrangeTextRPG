import {
  InteractionEntity,
  NPCEntity,
} from '@db/entities';
import { NPCInteractBuilderOptions } from '@npcs/@types';

import { npc5Info, poitionExchangeCondition } from './info';

export const npc5Seed = (options: NPCInteractBuilderOptions): void => {
  const {
    spot, baseInfo, dataCollection,
  } = options;

  const npc = dataCollection.addContainer<NPCEntity>(
    'NPC',
    {
      ...baseInfo,
      NPCId: npc5Info.id,
      subtype: npc5Info.subtype,
    },
  );

  dataCollection.addLink(spot, {
    ...baseInfo,
    to: npc.entity.interactionId,
    text: `💬 Поговорить с торговцем (${npc5Info.name})`,
    operation: `{{loadMerchantInfo "${npc5Info.id}"}}`,
    type: 'CUSTOM',
    subtype: 'DIALOG_START',
  });

  const i0 = dataCollection.addContainer<InteractionEntity>('Interaction', {
    ...baseInfo,
    text: '💬 [{{actorType player declension="nominative" capitalised=true}}]: Привет!',
  });

  const i1 = dataCollection.addContainer<InteractionEntity>('Interaction', {
    ...baseInfo,
    text: `💬 [${npc5Info.name}]: Привет!`,
  });

  const i2 = dataCollection.addContainer<InteractionEntity>('Interaction', {
    ...baseInfo,
    text: `💬 [${npc5Info.name}]: Извини, за столь скудный выбор.\n`
      + '{{#each (get currentMerchant showcase) as | good |}}'
      + '{{trueIndex @index}}: {{good.name}} = {{good.price}} золотых (📀)\n'
      + '{{/each}}',
  });

  const i3 = dataCollection.addContainer<InteractionEntity>('Interaction', {
    ...baseInfo,
    text: `💬 [${npc5Info.name}]: Чего изволишь?`,
  });

  const i4 = dataCollection.addContainer<InteractionEntity>('Interaction', {
    ...baseInfo,
    text: `💬 [${npc5Info.name}]: К сожалению, у {{actorType player declension="genitive"}} не хватает золота.`,
  });

  const i5 = dataCollection.addContainer<InteractionEntity>('Interaction', {
    ...baseInfo,
    text: '⚙️ У {{actorType player declension="genitive"}} осталось {{get player "gold"}} золота (📀)',
  });

  const i6 = dataCollection.addContainer<InteractionEntity>('Interaction', {
    ...baseInfo,
    text: `💬 [${npc5Info.name}]: Приходи еще :)`,
  });

  const i7 = dataCollection.addContainer<InteractionEntity>('Interaction', {
    ...baseInfo,
    text: `💬 [${npc5Info.name}]: Хмм... Ладно, для тебя сделаю исключение.\n`
      + `Если принесешь мне ${poitionExchangeCondition.count} крысинных хвостов, я отдам тебе взамен 1 маленькое зелье лечения`,
  });

  const i8 = dataCollection.addContainer<InteractionEntity>('Interaction', {
    ...baseInfo,
    text: `💬 [${npc5Info.name}]: А, ты еще жив. Ну что ж, уговор дороже денег ;)`,
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
    subtype: 'DIALOG_END',
  });
};
