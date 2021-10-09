import {
  AbstractEntity,
  InteractionEntity,
  DataContainer,
  createDataCollection,
} from '@db/entities';

import { ConnectorTo, ConnectorFrom } from './Connector';

export const baseInfo = <const>{
  scenarioId: 900,
  locationId: 1,
};

interface DemoBaseConnectors {
  data: Record<string, DataContainer<AbstractEntity>>,
  inboundOnStart: ConnectorFrom;
  outboundToExit: ConnectorTo;
  outboundToReturn: ConnectorTo;
}

export const demoBaseSeedRun = (): DemoBaseConnectors => {
  const dataCollection = createDataCollection();

  const i1 = dataCollection.addContainer<InteractionEntity>('Interaction', {
    ...baseInfo,
    isStart: true,
    text: 'БЕРИ МЕЧ И РУБИ!',
  });

  const i2 = dataCollection.addContainer<InteractionEntity>('Interaction', {
    ...baseInfo,
    text: 'Ладонь сжимает рукоять меча - шершавую и тёплую.',
  });

  const i3 = dataCollection.addContainer<InteractionEntity>('Interaction', {
    ...baseInfo,
    text: 'Воздух свистит, рассекаемый сталью, и расплывчатый силуэт перед тобой делает сальто назад.',
  });

  const i4 = dataCollection.addContainer<InteractionEntity>('Interaction', {
    ...baseInfo,
    text: 'Серый песок, фиолетовое небо, и расплывчатый клинок, торчащий из твоей грудины.\n'
      + 'Времени не было уже секунду назад; сейчас последние секунды с кровью утекают в песок.\n'
      + 'Вы проиграли',
  });

  const i5 = dataCollection.addContainer<InteractionEntity>('Interaction', {
    ...baseInfo,
    text: 'Продолжение следует...',
  });

  const i6 = dataCollection.addContainer<InteractionEntity>('Interaction', {
    ...baseInfo,
    text: 'Ну и что дальше?',
  });

  dataCollection.addLink(i1, {
    ...baseInfo,
    to: i2.entity.interactionId,
    text: 'ВЗЯТЬ МЕЧ',
    type: 'CUSTOM',
    subtype: 'OTHER',
  });

  dataCollection.addLink(i2, {
    ...baseInfo,
    to: i3.entity.interactionId,
    text: 'РУБИТЬ',
    type: 'CUSTOM',
    subtype: 'OTHER',
  });

  dataCollection.addLink(i1, {
    ...baseInfo,
    to: i4.entity.interactionId,
    text: 'ПОПЫТАТЬСЯ ОСМОТРЕТЬСЯ',
    type: 'CUSTOM',
    subtype: 'OTHER',
  });

  dataCollection.addLink(i2, {
    ...baseInfo,
    to: i4.entity.interactionId,
    text: 'ПОПЫТАТЬСЯ ОСМОТРЕТЬСЯ',
    type: 'CUSTOM',
    subtype: 'OTHER',
  });

  dataCollection.addLink(i3, {
    ...baseInfo,
    to: i5.entity.interactionId,
    text: 'Дальше?',
    type: 'CUSTOM',
    subtype: 'OTHER',
  });

  dataCollection.addLink(i5, {
    ...baseInfo,
    to: i6.entity.interactionId,
    text: '',
    type: 'AUTO',
    subtype: 'OTHER',
  });

  dataCollection.addLink(i4, {
    ...baseInfo,
    to: i6.entity.interactionId,
    text: '',
    type: 'AUTO',
    subtype: 'OTHER',
  });

  dataCollection.addLink(i6, {
    ...baseInfo,
    to: i1.entity.interactionId,
    text: 'Перезагрузить локацию',
    type: 'CUSTOM',
    subtype: 'RELOAD',
  });

  return <const>{
    data: dataCollection.data,
    inboundOnStart(connect: ConnectorTo) {
      connect(i1, 'Попробовать демо сюжет');
    },
    outboundToExit(exitInteraction: DataContainer<AbstractEntity>) {
      dataCollection.addLink(i6, {
        ...baseInfo,
        to: exitInteraction.entity.interactionId,
        text: 'ВСЕ! ХВАТИТ С МЕНЯ!',
        type: 'CUSTOM',
        subtype: 'EXIT_LOCATION',
      });
    },
    outboundToReturn(returnInteraction: DataContainer<AbstractEntity>) {
      dataCollection.addLink(i6, {
        ...baseInfo,
        to: returnInteraction.entity.interactionId,
        text: 'Вернутся к выбору локаций',
        type: 'CUSTOM',
        subtype: 'OTHER',
      });
    },
  };
};
