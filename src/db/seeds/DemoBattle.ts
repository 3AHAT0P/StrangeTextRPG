import {
  AbstractEntity,
  InteractionEntity,
  DataContainer,
  createDataCollection,
  buildBattleContainer,
} from '@db/entities';

import { ConnectorTo, ConnectorFrom } from './Connector';

export const baseInfo = <const>{
  scenarioId: 901,
  locationId: 1,
};

interface DemoBattleConnectors {
  data: Record<string, DataContainer<AbstractEntity>>,
  inboundOnStart: ConnectorFrom;
  outboundToReturn: ConnectorTo;
}

export const demoBattleSeedRun = (): DemoBattleConnectors => {
  const dataCollection = createDataCollection();

  const i0 = dataCollection.addContainer<InteractionEntity>('Interaction', {
    ...baseInfo,
    isStart: true,
    text: 'Загружаю тренировочный бой...',
  });

  const i1 = dataCollection.addContainer<InteractionEntity>('Interaction', {
    ...baseInfo,
    text: 'Ты победил, молодец!',
  });

  const i2 = dataCollection.addContainer<InteractionEntity>('Interaction', {
    ...baseInfo,
    text: 'К сожалению, ты умер.',
  });

  const i3 = dataCollection.addContainer<InteractionEntity>('Interaction', {
    ...baseInfo,
    text: 'Что дальше?',
  });

  const i4 = dataCollection.addContainer<InteractionEntity>('Interaction', {
    ...baseInfo,
    text: 'Ты начинаешь пятиться, но спотыкаешься о камень. Падая, ты замечаешь как твои враги набросились на тебя. Страх и адская боль от того что тебя разрывают на части - это последнее, что ты успел ощутить...',
  });

  buildBattleContainer(
    dataCollection,
    baseInfo,
    {
      difficult: 'EASY',
      chanceOfTriggering: 1,
    },
    {
      input: i0,
      win: i1,
      lose: i2,
      leave: i4,
    },
  );

  dataCollection.addLink(i1, {
    ...baseInfo,
    to: i3.entity.interactionId,
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

  dataCollection.addLink(i4, {
    ...baseInfo,
    to: i3.entity.interactionId,
    text: '',
    type: 'AUTO',
    subtype: 'OTHER',
  });

  dataCollection.addLink(i3, {
    ...baseInfo,
    to: i0.entity.interactionId,
    text: 'Перезагрузить локацию',
    type: 'CUSTOM',
    subtype: 'RELOAD',
  });

  return <const>{
    data: dataCollection.data,
    inboundOnStart(connect: ConnectorTo) {
      connect(i0, 'Попробовать демо бой');
    },
    outboundToReturn(returnInteraction: DataContainer<AbstractEntity>) {
      dataCollection.addLink(i3, {
        ...baseInfo,
        to: returnInteraction.entity.interactionId,
        text: 'Вернутся к выбору локаций',
        type: 'CUSTOM',
        subtype: 'OTHER',
      });
    },
  };
};
