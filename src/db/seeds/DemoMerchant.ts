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

  const merchant1 = dataCollection.addContainer<NPCEntity>('NPC', {
    ...baseInfo,
    NPCId: 1,
    subtype: 'MERCHANT',
  });

  const i0 = dataCollection.addContainer<InteractionEntity>('Interaction', {
    ...baseInfo,
    interactionId: '1',
    text: '⚙️ Завернув за угол, ты увидел человека за прилавком со всякими склянками.',
  });

  const i1 = dataCollection.addContainer<InteractionEntity>('Interaction', {
    ...baseInfo,
    text: '💬 [Торговец]: Привет!',
  });

  const i2 = dataCollection.addContainer<InteractionEntity>('Interaction', {
    ...baseInfo,
    text: '💬 [Торговец]: Извини, за столь скудный выбор.\n{{#each goods}}{{trueIndex @index}}: {{this.displayName}} = {{this.price}} золотых (📀)\n{{/each}}',
  });

  const i3 = dataCollection.addContainer<InteractionEntity>('Interaction', {
    ...baseInfo,
    text: '💬 [Торговец]: Чего изволишь?',
  });

  const i4 = dataCollection.addContainer<InteractionEntity>('Interaction', {
    ...baseInfo,
    text: '💬 [Торговец]: К сожалению, у {{actorType player declension="genitive"}} не хватает золота.',
  });

  const i5 = dataCollection.addContainer<InteractionEntity>('Interaction', {
    ...baseInfo,
    text: '⚙️ У {{actorType player declension="genitive"}} осталось {{get player "gold"}} золота (📀)',
  });

  const i6 = dataCollection.addContainer<InteractionEntity>('Interaction', {
    ...baseInfo,
    text: '💬 [Торговец]: Приходи еще :)',
  });

  dataCollection.addLink(merchant1, {
    ...baseInfo,
    to: i0.entity.interactionId,
    text: 'Talk',
    type: 'AUTO',
    subtype: 'OTHER',
  });

  dataCollection.addLink(i0, {
    ...baseInfo,
    to: i1.entity.interactionId,
    text: '💬 [{{actorType player declension="nominative" capitalised=true}}]: Привет!',
    type: 'CUSTOM',
    subtype: 'OTHER',
    isPrintable: true,
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
      connect(merchant1, 'Попробовать демо торговца');
    },
    outboundToReturn(returnInteraction: DataContainer<AbstractEntity>) {
      dataCollection.addLink(i6, {
        ...baseInfo,
        to: returnInteraction.entity.interactionId,
        text: '',
        type: 'AUTO',
        subtype: 'OTHER',
      });
    },
  };
};
