import {
  InteractionEntity,
  MapSpotEntity,
  DataCollection,
  DataContainer,
} from '@db/entities';
import { eventId as event1Id, eventStates as event1States } from '@scenarios/Scenario5/events/1';

interface EventBuilderOptions {
  dataCollection: DataCollection;
  spot: DataContainer<MapSpotEntity>;
  baseInfo: {
    readonly scenarioId: number;
    readonly locationId: number;
  };
}

const events: Record<number, (options: EventBuilderOptions) => void> = {
  1({ spot, baseInfo, dataCollection }: EventBuilderOptions) {
    const event1Interaction = dataCollection.addContainer<InteractionEntity>('Interaction', {
      ...baseInfo,
      text: 'Внезапно, {{actorType player declension="nominative"}} спотыкаешься о труп крысы.',
    });

    dataCollection.addLink(spot, {
      ...baseInfo,
      to: event1Interaction.entity.interactionId,
      text: '',
      condition: `{{eventStateIsEQ ${event1Id} ${event1States.INITIAL}}}`,
      type: 'AUTO',
      subtype: 'OTHER',
    });

    dataCollection.addLink(event1Interaction, {
      ...baseInfo,
      to: spot.entity.interactionId,
      text: '',
      operation: `{{updateEventState ${event1Id} ${event1States.READY_TO_INTERACT}}}`,
      type: 'AUTO',
      subtype: 'OTHER',
    });

    const event1LookupInteraction = dataCollection.addContainer<InteractionEntity>('Interaction', {
      ...baseInfo,
      text: 'Крыса, как крыса. Но в боку у нее торчит нож. О, теперь будет чем отбиваться от этих тварей!',
    });

    dataCollection.addLink(spot, {
      ...baseInfo,
      to: event1LookupInteraction.entity.interactionId,
      text: '👀 Осмотреть труп',
      condition: `{{eventStateIsEQ ${event1Id} ${event1States.READY_TO_INTERACT}}}`,
      type: 'CUSTOM',
      subtype: 'OTHER',
      isPrintable: true,
    });

    dataCollection.addLink(event1LookupInteraction, {
      ...baseInfo,
      to: spot.entity.interactionId,
      text: '',
      operation: `{{updateEventState ${event1Id} ${event1States.FINISHED}}}`,
      type: 'AUTO',
      subtype: 'OTHER',
    });
  },
};

export const eventBuilder = (id: number, options: EventBuilderOptions): void => {
  if (!(id in events)) throw new Error('EventId is incorrect!');
  return events[id](options);
};
