import { DBService } from '@db/DBService';
import { AbstractModel } from '@db/entities/Abstract';

import { ConnectorTo, ConnectorFrom } from './Connector';

export const baseInfo = <const>{
  scenarioId: 900,
  locationId: 1,
};

interface DemoBaseConnectors {
  inboundOnStart: ConnectorFrom;
  outboundToExit: ConnectorTo;
  outboundToReturn: ConnectorTo;
}

export const demoBaseSeedRun = async (dbService: DBService): Promise<DemoBaseConnectors> => {
  const { interactionRepo, actionRepo } = dbService.repositories;

  const i1 = await interactionRepo.create({
    ...baseInfo,
    interactionId: 1,
    text: 'БЕРИ МЕЧ И РУБИ!',
  });

  const i2 = await interactionRepo.create({
    ...baseInfo,
    interactionId: 2,
    text: 'Ладонь сжимает рукоять меча - шершавую и тёплую.',
  });

  const i3 = await interactionRepo.create({
    ...baseInfo,
    interactionId: 3,
    text: 'Воздух свистит, рассекаемый сталью, и расплывчатый силуэт перед тобой делает сальто назад.',
  });

  const i4 = await interactionRepo.create({
    ...baseInfo,
    interactionId: 4,
    text: 'Серый песок, фиолетовое небо, и расплывчатый клинок, торчащий из твоей грудины.\n'
      + 'Времени не было уже секунду назад; сейчас последние секунды с кровью утекают в песок.\n'
      + 'Вы проиграли',
  });

  const i5 = await interactionRepo.create({
    ...baseInfo,
    interactionId: 5,
    text: 'Продолжение следует...',
  });

  const i6 = await interactionRepo.create({
    ...baseInfo,
    interactionId: 6,
    text: 'Ну и что дальше?',
  });

  await actionRepo.create({
    ...baseInfo,
    from: i1.id,
    to: i2.id,
    text: 'ВЗЯТЬ МЕЧ',
    type: 'CUSTOM',
  });

  await actionRepo.create({
    ...baseInfo,
    from: i2.id,
    to: i3.id,
    text: 'РУБИТЬ',
    type: 'CUSTOM',
  });

  await actionRepo.create({
    ...baseInfo,
    from: i1.id,
    to: i4.id,
    text: 'ПОПЫТАТЬСЯ ОСМОТРЕТЬСЯ',
    type: 'CUSTOM',
  });

  await actionRepo.create({
    ...baseInfo,
    from: i2.id,
    to: i4.id,
    text: 'ПОПЫТАТЬСЯ ОСМОТРЕТЬСЯ',
    type: 'CUSTOM',
  });

  await actionRepo.create({
    ...baseInfo,
    from: i3.id,
    to: i5.id,
    text: 'Дальше?',
    type: 'CUSTOM',
  });

  await actionRepo.create({
    ...baseInfo,
    from: i5.id,
    to: i6.id,
    text: '',
    type: 'AUTO',
  });

  await actionRepo.create({
    ...baseInfo,
    from: i4.id,
    to: i6.id,
    text: '',
    type: 'AUTO',
  });

  await actionRepo.create({
    ...baseInfo,
    from: i6.id,
    to: i1.id,
    text: 'Перезагрузить локацию',
    type: 'CUSTOM',
  });

  return <const>{
    async inboundOnStart(connect: ConnectorTo) {
      await connect(i1, 'Попробовать демо сюжет');
    },
    async outboundToExit(exitInteraction: AbstractModel) {
      await actionRepo.create({
        ...baseInfo,
        from: i6.id,
        to: exitInteraction.id,
        text: 'ВСЕ! ХВАТИТ С МЕНЯ!',
        type: 'CUSTOM',
      });
    },
    async outboundToReturn(returnInteraction: AbstractModel) {
      await actionRepo.create({
        ...baseInfo,
        from: i6.id,
        to: returnInteraction.id,
        text: 'Вернутся к выбору локаций',
        type: 'CUSTOM',
      });
    },
  };
};
