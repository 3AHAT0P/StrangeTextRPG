import { RepositoriesHash } from '@db/DBService';
import { MapSpotModel } from '@db/entities';

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
    const eventId = 1;
    const eventStates = <const>{
      INITIAL: 0,
      READY_TO_INTERACT: 1,
      FINISHED: 2,
    };
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
      condition: `{{isLTE (get events ${eventId}) ${eventStates.READY_TO_INTERACT}}}`,
      type: 'AUTO',
    });

    await actionRepo.create({
      ...baseInfo,
      from: event1Interaction.id,
      to: spot.id,
      text: '',
      operation: `{{set events ${eventId} ${eventStates.READY_TO_INTERACT}}}`,
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
      condition: `{{isEQ (get events ${eventId}) ${eventStates.READY_TO_INTERACT}}}`,
      type: 'CUSTOM',
      isPrintable: true,
    });

    await actionRepo.create({
      ...baseInfo,
      from: event1LookupInteraction.id,
      to: spot.id,
      text: '',
      operation: `{{set events ${eventId} ${eventStates.FINISHED}}}`,
      type: 'AUTO',
    });
  },
};

export const eventBuilder = (id: number, options: EventBuilderOptions): Promise<void> => {
  if (!(id in events)) throw new Error('EventId is incorrect!');
  return events[id](options);
};
