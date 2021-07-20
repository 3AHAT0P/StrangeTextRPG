import { DBService } from '@db/DBService';
import { AbstractModel } from '@db/entities/Abstract';

import { ConnectorFrom, ConnectorTo } from './Connector';

export const baseInfo = <const>{
  scenarioId: 0,
  locationId: 1,
};

interface IntroConnectors {
  inboundOnReload: ConnectorFrom;
  inboundOnReturn: ConnectorFrom;
  inboundOnExit: ConnectorFrom;
  outboundToDemoScenario: ConnectorTo;
  outboundToScenario: ConnectorTo;
}

export const introSeedRun = async (dbService: DBService): Promise<IntroConnectors> => {
  const { interactionRepo, actionRepo } = dbService.repositories;

  const i1 = await interactionRepo.create({
    ...baseInfo,
    interactionId: 1,
    text: 'Добро пожаловать в эту странную текстовую РПГ (Демо версия).\n'
      + 'Что бы ты хотел попробовать?',
  });

  const i2 = await interactionRepo.create({
    ...baseInfo,
    interactionId: 2,
    text: 'Это режим в котором можно попробовать те или иные механики игры.\n'
      + 'Выбери что тебе интересно.',
  });

  const i3 = await interactionRepo.create({
    ...baseInfo,
    interactionId: 3,
    text: 'Удачи!',
  });

  await actionRepo.create({
    ...baseInfo,
    from: i1.id,
    to: i2.id,
    text: 'Перейти к списку механик',
    type: 'CUSTOM',
  });

  await actionRepo.create({
    ...baseInfo,
    from: i2.id,
    to: i1.id,
    text: 'Назад',
    type: 'CUSTOM',
  });

  return <const>{
    async inboundOnReload(connect: ConnectorTo) {
      await connect(i1, 'Reloading...');
      // await actionRepo.create({
      //   ...baseInfo,
      //   from: from.id,
      //   to: i1.id,
      //   text: 'Reloading...',
      //   type: 'SYSTEM',
      // });
    },
    async inboundOnReturn(connect: ConnectorTo) {
      await connect(i1, 'OnReturn');
    },
    async inboundOnExit(connect: ConnectorTo) {
      await connect(i3, 'OnExit');
    },
    async outboundToDemoScenario(demo: AbstractModel, text: string) {
      await actionRepo.create({
        ...baseInfo,
        from: i2.id,
        to: demo.id,
        text,
        type: 'CUSTOM',
      });
    },
    async outboundToScenario(scenario: AbstractModel, text: string) {
      await actionRepo.create({
        ...baseInfo,
        from: i1.id,
        to: scenario.id,
        text,
        type: 'CUSTOM',
      });
    },
  };
};
