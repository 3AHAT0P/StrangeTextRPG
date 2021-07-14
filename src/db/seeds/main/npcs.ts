import { RepositoriesHash } from '@db/DBService';
import { MapSpotModel, NPCModel } from '@db/entities';

interface NPCInteractBuilderOptions {
  spot: MapSpotModel;
  repositories: RepositoriesHash;
  npc: NPCModel;
  baseInfo: {
    readonly scenarioId: number;
    readonly locationId: number;
  };
}

const NPCInteractions: Record<number | 'default', (options: NPCInteractBuilderOptions) => Promise<void>> = {
  async default(options: NPCInteractBuilderOptions) {
    const {
      spot, repositories, npc: merchant, baseInfo,
    } = options;
    const { interactionRepo, actionRepo } = repositories;

    // @TODO: Тут айдишниги полная фигня
    const i0 = await interactionRepo.create({
      ...baseInfo,
      interactionId: 8 * 1e7 + merchant.id * 1e3 + 0,
      text: '💬 [{{actorType player declension="nominative" capitalised=true}}]: Привет!',
    });

    const i1 = await interactionRepo.create({
      ...baseInfo,
      interactionId: 8 * 1e7 + merchant.id * 1e3 + 1,
      text: '💬 [Торговец]: Привет!',
    });

    const i2 = await interactionRepo.create({
      ...baseInfo,
      interactionId: 8 * 1e7 + merchant.id * 1e3 + 2,
      text: '💬 [Торговец]: Извини, за столь скудный выбор.\n{{#each goods}}{{trueIndex @index}}: {{this.displayName}} = {{this.price}} золотых (📀)\n{{/each}}',
    });

    const i3 = await interactionRepo.create({
      ...baseInfo,
      interactionId: 8 * 1e7 + merchant.id * 1e3 + 3,
      text: '💬 [Торговец]: Чего изволишь?',
    });

    const i4 = await interactionRepo.create({
      ...baseInfo,
      interactionId: 8 * 1e7 + merchant.id * 1e3 + 4,
      text: '💬 [Торговец]: К сожалению, у {{actorType player declension="genitive"}} не хватает золота.',
    });

    const i5 = await interactionRepo.create({
      ...baseInfo,
      interactionId: 8 * 1e7 + merchant.id * 1e3 + 5,
      text: '⚙️ У {{actorType player declension="genitive"}} осталось {{get player "gold"}} золота (📀)',
    });

    const i6 = await interactionRepo.create({
      ...baseInfo,
      interactionId: 8 * 1e7 + merchant.id * 1e3 + 6,
      text: '💬 [Торговец]: Приходи еще :)',
    });

    await actionRepo.create({
      ...baseInfo,
      from: merchant.id,
      to: i0.id,
      text: '',
      type: 'AUTO',
    });

    await actionRepo.create({
      ...baseInfo,
      from: i0.id,
      to: i1.id,
      text: '',
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
      text: '💬 [{{actorType player declension="nominative" capitalised=true}}]: Ничего, спасибо.',
      type: 'CUSTOM',
      isPrintable: true,
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

    await actionRepo.create({
      ...baseInfo,
      from: i6.id,
      to: spot.id,
      text: '',
      type: 'AUTO',
    });
  },
};

export const npcInteractionBuilder = (id: number | 'default', options: NPCInteractBuilderOptions): Promise<void> => {
  if (!(id in NPCInteractions)) throw new Error('EventId is incorrect!');
  return NPCInteractions[id](options);
};
