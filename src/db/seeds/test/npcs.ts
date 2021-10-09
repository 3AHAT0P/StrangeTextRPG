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
  baseInfo: {
    readonly scenarioId: number;
    readonly locationId: number;
  };
}

const NPCInteractions: Record<number, (options: NPCInteractBuilderOptions) => void> = {
  1(options: NPCInteractBuilderOptions): void {
    const {
      spot, baseInfo, dataCollection,
    } = options;

    const npcId = `Scenario:${baseInfo.scenarioId}|Location:${baseInfo.locationId}|NPC:1`;
    const npc = dataCollection.addContainer<NPCEntity>(
      'NPC',
      {
        ...baseInfo,
        NPCId: 1,
        subtype: 'MERCHANT',
      },
    );

    dataCollection.addLink(spot, {
      ...baseInfo,
      to: npc.entity.interactionId,
      text: '💬 Поговорить с торговцем (#1)',
      operation: `{{loadMerchantInfo "${npcId}"}}`,
      type: 'CUSTOM',
      subtype: 'TALK_TO_NPC',
    });

    const i0 = dataCollection.addContainer<InteractionEntity>('Interaction', {
      ...baseInfo,
      text: '💬 [{{actorType player declension="nominative" capitalised=true}}]: Привет!',
    });

    const i1 = dataCollection.addContainer<InteractionEntity>('Interaction', {
      ...baseInfo,
      text: '💬 [{{get currentMerchant "name"}}]: Привет!',
    });

    const i2 = dataCollection.addContainer<InteractionEntity>('Interaction', {
      ...baseInfo,
      text: '💬 [{{get currentMerchant "name"}}]: Извини, за столь скудный выбор.\n'
        + '{{#each (get currentMerchant showcase) as | good |}}'
        + '{{trueIndex @index}}: {{good.name}} = {{good.price}} золотых (📀)\n'
        + '{{/each}}',
    });

    const i3 = dataCollection.addContainer<InteractionEntity>('Interaction', {
      ...baseInfo,
      text: '💬 [{{get currentMerchant "name"}}]: Чего изволишь?',
    });

    const i4 = dataCollection.addContainer<InteractionEntity>('Interaction', {
      ...baseInfo,
      text: '💬 [{{get currentMerchant "name"}}]: К сожалению, у {{actorType player declension="genitive"}} не хватает золота.',
    });

    const i5 = dataCollection.addContainer<InteractionEntity>('Interaction', {
      ...baseInfo,
      text: '⚙️ У {{actorType player declension="genitive"}} осталось {{get player "gold"}} золота (📀)',
    });

    const i6 = dataCollection.addContainer<InteractionEntity>('Interaction', {
      ...baseInfo,
      text: '💬 [{{get currentMerchant "name"}}]: Приходи еще :)',
    });

    dataCollection.addLink(npc, {
      ...baseInfo,
      to: i0.entity.interactionId,
      text: '',
      type: 'AUTO',
      subtype: 'OTHER',
    });

    dataCollection.addLink(i0, {
      ...baseInfo,
      to: i1.entity.interactionId,
      text: '',
      type: 'AUTO',
      subtype: 'OTHER',
    });

    dataCollection.addLink(i1, {
      ...baseInfo,
      to: i2.entity.interactionId,
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
      to: i4.entity.interactionId,
      text: '',
      type: 'SYSTEM',
      subtype: 'DEAL_FAILURE',
    });

    dataCollection.addLink(i3, {
      ...baseInfo,
      to: i5.entity.interactionId,
      text: '',
      type: 'SYSTEM',
      subtype: 'DEAL_SUCCESS',
    });

    dataCollection.addLink(i3, {
      ...baseInfo,
      to: i6.entity.interactionId,
      text: '💬 [{{actorType player declension="nominative" capitalised=true}}]: Ничего, спасибо.',
      type: 'CUSTOM',
      subtype: 'OTHER',
      isPrintable: true,
    });

    dataCollection.addLink(i4, {
      ...baseInfo,
      to: i3.entity.interactionId,
      text: '',
      type: 'AUTO',
      subtype: 'OTHER',
    });

    dataCollection.addLink(i5, {
      ...baseInfo,
      to: i3.entity.interactionId,
      text: '',
      type: 'AUTO',
      subtype: 'OTHER',
    });

    dataCollection.addLink(i6, {
      ...baseInfo,
      to: spot.entity.interactionId,
      text: '',
      operation: '{{unloadCurrentMerchant}}',
      type: 'AUTO',
      subtype: 'OTHER',
    });
  },
  2(options: NPCInteractBuilderOptions): void {
    const {
      spot, baseInfo, dataCollection,
    } = options;

    const npcId = `Scenario:${baseInfo.scenarioId}|Location:${baseInfo.locationId}|NPC:2`;
    const questId = `${npcId}|Quest:1`;

    const npc = dataCollection.addContainer<NPCEntity>(
      'NPC',
      {
        ...baseInfo,
        NPCId: 2,
        subtype: 'WITH_QUEST',
      },
    );

    dataCollection.addLink(spot, {
      ...baseInfo,
      to: npc.entity.interactionId,
      text: '',
      operation: `{{loadNPCInfo "${npcId}"}}`,
      type: 'AUTO',
      subtype: 'OTHER',
    });

    // const npcName = 'Незнакомец';

    const i0 = options.dataCollection.addContainer<InteractionEntity>('Interaction', {
      ...baseInfo,
      text: '💬 [{{get currentNPC "name"}}]: Эй, Путник! Помоги мне...',
    });

    options.dataCollection.addLink(npc, {
      ...baseInfo,
      to: i0.entity.interactionId,
      text: '',
      type: 'AUTO',
      subtype: 'OTHER',
    });

    const i1 = options.dataCollection.addContainer<InteractionEntity>('Interaction', {
      ...baseInfo,
      text: '💬 [{{get currentNPC "name"}}]: Проходя тут, я напаролся на большую крысу!\n'
        + 'У нас был тяжелый бой, и я ее убил\n'
        + 'Однако уйти из боя целым, у меня не вышло.\n'
        + 'Принеси мне, пожалуйста, зелье лечения. Мне не у кого больше попросить.',
    });

    options.dataCollection.addLink(i0, {
      ...baseInfo,
      to: i1.entity.interactionId,
      text: '💬 [{{actorType player declension="nominative" capitalised=true}}]: Привет, что случилось?',
      condition: `{{questStateIsEQ ${questId} "INITIAL"}}`,
      operation: `{{updateQuestState ${questId} "PHASE_1"}}`,
      type: 'CUSTOM',
      subtype: 'START_QUEST',
    });

    options.dataCollection.addLink(i0, {
      ...baseInfo,
      to: spot.entity.interactionId,
      text: '💬 [{{actorType player declension="nominative" capitalised=true}}]: Отстань!',
      condition: `{{questStateIsEQ ${questId} "INITIAL"}}`,
      type: 'CUSTOM',
      subtype: 'TALK_TO_NPC',
    });

    options.dataCollection.addLink(i0, {
      ...baseInfo,
      to: i1.entity.interactionId,
      text: '',
      type: 'AUTO',
      subtype: 'OTHER',
    });

    // options.dataCollection.addLink(i1, {
    //   ...baseInfo,
    //   to: i2.entity.interactionId,
    //   text: '',
    //   type: 'AUTO',
    //   subtype: 'OTHER',
    // });

    // options.dataCollection.addLink(i6, {
    //   ...baseInfo,
    //   to: spot.entity.interactionId,
    //   text: '',
    //   type: 'AUTO',
    //   subtype: 'OTHER',
    // });
  },
};

export const npcInteractionBuilder = (id: number, options: NPCInteractBuilderOptions): void => {
  if (!(id in NPCInteractions)) throw new Error('EventId is incorrect!');

  return NPCInteractions[id](options);
};
