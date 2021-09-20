import {
  InteractionEntity,
  NPCEntity,
  MapSpotEntity,
  DataContainer,
  DataCollection,
} from '@db/entities';

interface NPCInteractBuilderOptions {
  dataCollection: DataCollection;
  spot: DataContainer<MapSpotEntity>;
  npc: DataContainer<NPCEntity>;
  baseInfo: {
    readonly scenarioId: number;
    readonly locationId: number;
  };
}

const NPCInteractions: Record<number | 'default', (options: NPCInteractBuilderOptions) => void> = {
  default(options: NPCInteractBuilderOptions) {
    const {
      spot, npc: merchant, baseInfo,
    } = options;

    const i0 = options.dataCollection.addContainer<InteractionEntity>('Interaction', {
      ...baseInfo,
      text: '💬 [{{actorType player declension="nominative" capitalised=true}}]: Привет!',
    });

    const i1 = options.dataCollection.addContainer<InteractionEntity>('Interaction', {
      ...baseInfo,
      text: '💬 [Торговец]: Привет!',
    });

    const i2 = options.dataCollection.addContainer<InteractionEntity>('Interaction', {
      ...baseInfo,
      text: '💬 [Торговец]: Извини, за столь скудный выбор.\n{{#each goods}}{{trueIndex @index}}: {{this.displayName}} = {{this.price}} золотых (📀)\n{{/each}}',
    });

    const i3 = options.dataCollection.addContainer<InteractionEntity>('Interaction', {
      ...baseInfo,
      text: '💬 [Торговец]: Чего изволишь?',
    });

    const i4 = options.dataCollection.addContainer<InteractionEntity>('Interaction', {
      ...baseInfo,
      text: '💬 [Торговец]: К сожалению, у {{actorType player declension="genitive"}} не хватает золота.',
    });

    const i5 = options.dataCollection.addContainer<InteractionEntity>('Interaction', {
      ...baseInfo,
      text: '⚙️ У {{actorType player declension="genitive"}} осталось {{get player "gold"}} золота (📀)',
    });

    const i6 = options.dataCollection.addContainer<InteractionEntity>('Interaction', {
      ...baseInfo,
      text: '💬 [Торговец]: Приходи еще :)',
    });

    options.dataCollection.addLink(merchant, {
      ...baseInfo,
      to: i0.entity.interactionId,
      text: '',
      type: 'AUTO',
      subtype: 'OTHER',
    });

    options.dataCollection.addLink(i0, {
      ...baseInfo,
      to: i1.entity.interactionId,
      text: '',
      type: 'AUTO',
      subtype: 'OTHER',
    });

    options.dataCollection.addLink(i1, {
      ...baseInfo,
      to: i2.entity.interactionId,
      text: '',
      type: 'AUTO',
      subtype: 'OTHER',
    });

    options.dataCollection.addLink(i2, {
      ...baseInfo,
      to: i3.entity.interactionId,
      text: '',
      type: 'AUTO',
      subtype: 'OTHER',
    });

    options.dataCollection.addLink(i3, {
      ...baseInfo,
      to: i4.entity.interactionId,
      text: '',
      type: 'SYSTEM',
      subtype: 'DEAL_FAILURE',
    });

    options.dataCollection.addLink(i3, {
      ...baseInfo,
      to: i5.entity.interactionId,
      text: '',
      type: 'SYSTEM',
      subtype: 'DEAL_SUCCESS',
    });

    options.dataCollection.addLink(i3, {
      ...baseInfo,
      to: i6.entity.interactionId,
      text: '💬 [{{actorType player declension="nominative" capitalised=true}}]: Ничего, спасибо.',
      type: 'CUSTOM',
      subtype: 'OTHER',
      isPrintable: true,
    });

    options.dataCollection.addLink(i4, {
      ...baseInfo,
      to: i3.entity.interactionId,
      text: '',
      type: 'AUTO',
      subtype: 'OTHER',
    });

    options.dataCollection.addLink(i5, {
      ...baseInfo,
      to: i3.entity.interactionId,
      text: '',
      type: 'AUTO',
      subtype: 'OTHER',
    });

    options.dataCollection.addLink(i6, {
      ...baseInfo,
      to: spot.entity.interactionId,
      text: '',
      type: 'AUTO',
      subtype: 'OTHER',
    });
  },
};

export const npcInteractionBuilder = (id: number | 'default', options: NPCInteractBuilderOptions): void => {
  if (!(id in NPCInteractions)) throw new Error('EventId is incorrect!');

  return NPCInteractions[id](options);
};