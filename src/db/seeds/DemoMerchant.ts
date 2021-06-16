import { DBService } from '@db/DBService';
import { AbstractModel } from '@db/entities/Abstract';

import { ConnectorTo, ConnectorFrom } from './Connector';

export const baseInfo = <const>{
  scenarioId: 902,
  locationId: 1,
};

interface DemoMerchantConnectors {
  inboundOnStart: ConnectorFrom;
  outboundToReturn: ConnectorTo;
}

export const demoMerchantSeedRun = async (dbService: DBService): Promise<DemoMerchantConnectors> => {
  const { npcRepo, interactionRepo, actionRepo } = dbService.repositories;

  const merchant1 = await npcRepo.create({
    ...baseInfo,
    NPCId: 1,
    subtype: 'MERCHANT',
  });

  const i1 = await interactionRepo.create({
    ...baseInfo,
    interactionId: 1,
    text: '💬 [Торговец]: Привет!',
  });

  const i2 = await interactionRepo.create({
    ...baseInfo,
    interactionId: 2,
    text: '💬 [Торговец]: Извини, за столь скудный выбор.\n{{printGoodList .goods}}',
  });

  const i3 = await interactionRepo.create({
    ...baseInfo,
    interactionId: 3,
    text: '💬 [Торговец]: Чего изволишь?',
  });

  const i4 = await interactionRepo.create({
    ...baseInfo,
    interactionId: 4,
    text: '💬 [Торговец]: К сожалению, у {{actorType .player (declension=\'genitive\')}} не хватает золота.',
  });

  const i5 = await interactionRepo.create({
    ...baseInfo,
    interactionId: 5,
    text: '⚙️ У {{actorType .player (declension=\'genitive\')}} осталось {{get .player \'gold\'}} золота',
  });

  const i6 = await interactionRepo.create({
    ...baseInfo,
    interactionId: 6,
    text: '💬 [Торговец]: Приходи еще :)',
  });

  await actionRepo.create({
    ...baseInfo,
    from: merchant1.id,
    to: i1.id,
    text: 'Talk',
    type: 'AUTO',
  });

  await actionRepo.create({
    ...baseInfo,
    from: i1.id,
    to: i2.id,
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
    to: i4.id,
    text: 'OnDealFailure',
    type: 'SYSTEM',
  });

  await actionRepo.create({
    ...baseInfo,
    from: i3.id,
    to: i5.id,
    text: 'OnDealSuccess',
    type: 'SYSTEM',
  });

  await actionRepo.create({
    ...baseInfo,
    from: i3.id,
    to: i6.id,
    text: '💬 [{{actorType .player (declension=\'nominative\', capitalised)}}]: Ничего, спасибо.',
    type: 'CUSTOM',
  });

  await actionRepo.create({
    ...baseInfo,
    from: i4.id,
    to: i3.id,
    text: '',
    type: 'AUTO',
  });

  await actionRepo.create({
    ...baseInfo,
    from: i5.id,
    to: i3.id,
    text: '',
    type: 'AUTO',
  });

  return <const>{
    async inboundOnStart(connect: ConnectorTo) {
      await connect(merchant1, '💬 [{{actorType .player (declension=\'nominative\', capitalised)}}]: Привет!');
    },
    async outboundToReturn(returnInteraction: AbstractModel) {
      await actionRepo.create({
        ...baseInfo,
        from: i6.id,
        to: returnInteraction.id,
        text: '',
        type: 'AUTO',
      });
    },
  };
};
