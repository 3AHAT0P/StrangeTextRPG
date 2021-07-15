import { RepositoriesHash } from '@db/DBService';
import { MapSpotModel } from '@db/entities';
import { eventId as event1Id, eventStates as event1States } from '@scenarios/Scenario5/events/1';

interface EventBuilderOptions {
  spot: MapSpotModel;
  repositories: RepositoriesHash;
  baseInfo: {
    readonly scenarioId: number;
    readonly locationId: number;
  };
}

const events: Record<number, (options: EventBuilderOptions) => Promise<void>> = {
  async 1({ spot, repositories, baseInfo }: EventBuilderOptions) {
    const { interactionRepo, actionRepo } = repositories;
    const event1Interaction = await interactionRepo.create({
      ...baseInfo,
      interactionId: 9010,
      text: 'Внезапно, {{actorType player declension="nominative"}} спотыкаешься о труп крысы.',
    });

    await actionRepo.create({
      ...baseInfo,
      from: spot.id,
      to: event1Interaction.id,
      text: '',
      condition: `{{eventStateIsEQ ${event1Id} ${event1States.INITIAL}}}`,
      type: 'AUTO',
    });

    await actionRepo.create({
      ...baseInfo,
      from: event1Interaction.id,
      to: spot.id,
      text: '',
      operation: `{{updateEventState ${event1Id} ${event1States.READY_TO_INTERACT}}}`,
      type: 'AUTO',
    });

    const event1LookupInteraction = await interactionRepo.create({
      ...baseInfo,
      interactionId: 9011,
      text: 'Крыса, как крыса. Но в боку у нее торчит нож. О, теперь будет чем отбиваться от этих тварей!',
    });

    await actionRepo.create({
      ...baseInfo,
      from: spot.id,
      to: event1LookupInteraction.id,
      text: '👀 Осмотреть труп',
      condition: `{{eventStateIsEQ ${event1Id} ${event1States.READY_TO_INTERACT}}}`,
      type: 'CUSTOM',
      isPrintable: true,
    });

    await actionRepo.create({
      ...baseInfo,
      from: event1LookupInteraction.id,
      to: spot.id,
      text: '',
      operation: `{{updateEventState ${event1Id} ${event1States.FINISHED}}}`,
      type: 'AUTO',
    });
  },
};

export const eventBuilder = (id: number, options: EventBuilderOptions): Promise<void> => {
  if (!(id in events)) throw new Error('EventId is incorrect!');
  return events[id](options);
};
