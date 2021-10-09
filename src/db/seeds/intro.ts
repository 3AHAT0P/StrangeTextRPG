import {
  DataContainer, InteractionEntity, AbstractEntity, createDataCollection,
} from '@db/entities';

import { ConnectorFrom, ConnectorTo } from './Connector';

export const baseInfo = <const>{
  scenarioId: 0,
  locationId: 1,
};

interface SeedResult {
  data: Record<string, DataContainer<AbstractEntity>>,
  inboundOnReload: ConnectorFrom;
  inboundOnReturn: ConnectorFrom;
  inboundOnExit: ConnectorFrom;
  outboundToDemoScenario: ConnectorTo;
  outboundToScenario: ConnectorTo;
}

export const introSeedRun = (): SeedResult => {
  const dataCollection = createDataCollection();
  const i1 = dataCollection.addContainer<InteractionEntity>('Interaction', {
    ...baseInfo,
    isStart: true,
    text: 'Добро пожаловать в эту странную текстовую РПГ (Демо версия).\n'
      + 'Что бы ты хотел попробовать?',
  });

  const i2 = dataCollection.addContainer<InteractionEntity>('Interaction', {
    ...baseInfo,
    text: 'Это режим в котором можно попробовать те или иные механики игры.\n'
      + 'Выбери что тебе интересно.',
  });

  const i3 = dataCollection.addContainer<InteractionEntity>('Interaction', {
    ...baseInfo,
    text: 'Удачи!',
  });

  dataCollection.addLink(i1, {
    ...baseInfo,
    to: i2.entity.interactionId,
    text: 'Перейти к списку механик',
    type: 'CUSTOM',
    subtype: 'OTHER',
  });

  dataCollection.addLink(i2, {
    ...baseInfo,
    to: i1.entity.interactionId,
    text: 'Назад',
    type: 'CUSTOM',
    subtype: 'BACK',
  });

  dataCollection.addLink(i3, {
    ...baseInfo,
    to: i1.entity.interactionId,
    text: '',
    type: 'AUTO',
    subtype: 'OTHER',
  });

  return <const>{
    data: dataCollection.data,
    inboundOnReload(connect: ConnectorTo) {
      connect(i1, 'Reloading...');
    },
    inboundOnReturn(connect: ConnectorTo) {
      connect(i1, 'OnReturn');
    },
    inboundOnExit(connect: ConnectorTo) {
      connect(i3, 'OnExit');
    },
    outboundToDemoScenario(demo: DataContainer<AbstractEntity>, text: string) {
      dataCollection.addLink(i2, {
        ...baseInfo,
        to: demo.entity.interactionId,
        text,
        type: 'CUSTOM',
        subtype: 'OTHER',
      });
    },
    outboundToScenario(scenario: DataContainer<AbstractEntity>, text: string) {
      dataCollection.addLink(i1, {
        ...baseInfo,
        to: scenario.entity.interactionId,
        text,
        type: 'CUSTOM',
        subtype: 'OTHER',
      });
    },
  };
};
