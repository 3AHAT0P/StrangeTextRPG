import {
  AbstractEntity,
  InteractionEntity,
  DataContainer,
  createDataCollection,
  BattleEntity,
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
    text: 'На тебя напали.',
  });

  const b1 = dataCollection.addContainer<BattleEntity>('Battle', {
    ...baseInfo,
    difficult: 'EASY',
    chanceOfTriggering: 1,
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

  dataCollection.addLink(i0, {
    ...baseInfo,
    to: b1.entity.interactionId,
    text: '',
    type: 'AUTO',
    subtype: 'BATTLE_START',
  });

  dataCollection.addLink(b1, {
    ...baseInfo,
    to: i1.entity.interactionId,
    text: '',
    type: 'AUTO',
    subtype: 'BATTLE_WIN',
  });

  dataCollection.addLink(b1, {
    ...baseInfo,
    to: i2.entity.interactionId,
    text: '',
    type: 'AUTO',
    subtype: 'BATTLE_LOSE',
  });

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
