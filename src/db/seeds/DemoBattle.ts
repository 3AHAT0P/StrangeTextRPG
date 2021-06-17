import { DBService } from '@db/DBService';
import { AbstractModel } from '@db/entities/Abstract';

import { ConnectorTo, ConnectorFrom } from './Connector';

export const baseInfo = <const>{
  scenarioId: 901,
  locationId: 1,
};

interface DemoBattleConnectors {
  inboundOnStart: ConnectorFrom;
  outboundToReturn: ConnectorTo;
}

export const demoBattleSeedRun = async (dbService: DBService): Promise<DemoBattleConnectors> => {
  const { battleRepo, interactionRepo, actionRepo } = dbService.repositories;

  const b1 = await battleRepo.create({
    ...baseInfo,
    difficult: 'EASY',
    chanceOfTriggering: 1,
  });

  const i1 = await interactionRepo.create({
    ...baseInfo,
    interactionId: 1,
    text: 'Ты победил, молодец!',
  });

  const i2 = await interactionRepo.create({
    ...baseInfo,
    interactionId: 2,
    text: 'К сожалению, ты умер.',
  });

  const i3 = await interactionRepo.create({
    ...baseInfo,
    interactionId: 3,
    text: 'Что дальше?',
  });

  await actionRepo.create({
    ...baseInfo,
    from: b1.id,
    to: i1.id,
    text: 'OnWin',
    type: 'AUTO',
  });

  await actionRepo.create({
    ...baseInfo,
    from: b1.id,
    to: i2.id,
    text: 'OnLose',
    type: 'AUTO',
  });

  await actionRepo.create({
    ...baseInfo,
    from: i1.id,
    to: i3.id,
    text: '',
    type: 'AUTO',
  });

  await actionRepo.create({
    ...baseInfo,
    from: i2.id,
    to: i3.id,
    text: '',
    type: 'AUTO',
  });

  await actionRepo.create({
    ...baseInfo,
    from: i3.id,
    to: b1.id,
    text: 'Перезагрузить локацию',
    type: 'CUSTOM',
  });

  return <const>{
    async inboundOnStart(connect: ConnectorTo) {
      await connect(b1, 'Попробовать демо бой');
    },
    async outboundToReturn(returnInteraction: AbstractModel) {
      await actionRepo.create({
        ...baseInfo,
        from: i3.id,
        to: returnInteraction.id,
        text: 'Вернутся к выбору локаций',
        type: 'CUSTOM',
      });
    },
  };
};
