import {
  AbstractEntity,
  InteractionEntity,
  DataContainer,
  createDataCollection,
  NPCEntity,
} from '@db/entities';

import { ConnectorTo, ConnectorFrom } from './Connector';

export const baseInfo = <const>{
  scenarioId: 902,
  locationId: 1,
};

interface DemoMerchantConnectors {
  data: Record<string, DataContainer<AbstractEntity>>,
  inboundOnStart: ConnectorFrom;
  outboundToReturn: ConnectorTo;
}

export const demoMerchantSeedRun = (): DemoMerchantConnectors => {
  const dataCollection = createDataCollection();

  const intro = dataCollection.addContainer<InteractionEntity>('Interaction', {
    ...baseInfo,
    isStart: true,
    text: '⚙️ Завернув за угол, ты увидел человека за прилавком со всякими склянками.',
  });

  const npcId = `Scenario:${baseInfo.scenarioId}|Location:${baseInfo.locationId}|NPC:1`;

  const npc = dataCollection.addContainer<NPCEntity>('NPC', {
    ...baseInfo,
    NPCId: 'Scenario:DEMO|NPC:1',
    subtype: 'MERCHANT',
  });

  dataCollection.addLink(intro, {
    ...baseInfo,
    to: npc.entity.interactionId,
    text: '💬 Поговорить с торговцем (#1)',
    operation: `{{loadMerchantInfo "${npcId}"}}`,
    type: 'CUSTOM',
    subtype: 'DIALOG_START',
  });

  const i0 = dataCollection.addContainer<InteractionEntity>('Interaction', {
    ...baseInfo,
    text: '💬 [{{actorType player declension="nominative" capitalised=true}}]: Привет!',
  });

  const i1 = dataCollection.addContainer<InteractionEntity>('Interaction', {
    ...baseInfo,
    text: '💬 [{{get currentMerchant "name"}}]: Привет!',
  });

  const i2 = dataCollection.addContainer<InteractionEntity>('Interaction', {
    ...baseInfo,
    text: '💬 [{{get currentMerchant "name"}}]: Извини, за столь скудный выбор.\n'
      + '{{#each (get currentMerchant showcase) as | good |}}'
      + '{{trueIndex @index}}: {{good.name}} = {{good.price}} золотых (📀)\n'
      + '{{/each}}',
  });

  const i3 = dataCollection.addContainer<InteractionEntity>('Interaction', {
    ...baseInfo,
    text: '💬 [{{get currentMerchant "name"}}]: Чего изволишь?',
  });

  const i4 = dataCollection.addContainer<InteractionEntity>('Interaction', {
    ...baseInfo,
    text: '💬 [{{get currentMerchant "name"}}]: К сожалению, у {{actorType player declension="genitive"}} не хватает золота.',
  });

  const i5 = dataCollection.addContainer<InteractionEntity>('Interaction', {
    ...baseInfo,
    text: '⚙️ У {{actorType player declension="genitive"}} осталось {{get player "gold"}} золота (📀)',
  });

  const i6 = dataCollection.addContainer<InteractionEntity>('Interaction', {
    ...baseInfo,
    text: '💬 [{{get currentMerchant "name"}}]: Приходи еще :)',
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
    to: i6.entity.interactionId,
    text: '💬 [{{actorType player declension="nominative" capitalised=true}}]: Ничего, спасибо.',
    type: 'CUSTOM',
    subtype: 'OTHER',
    isPrintable: true,
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

  return <const>{
    data: dataCollection.data,
    inboundOnStart(connect: ConnectorTo) {
      connect(intro, 'Попробовать демо торговца');
    },
    outboundToReturn(returnInteraction: DataContainer<AbstractEntity>) {
      dataCollection.addLink(i6, {
        ...baseInfo,
        to: returnInteraction.entity.interactionId,
        text: '',
        type: 'AUTO',
        subtype: 'DIALOG_END',
      });
    },
  };
};
