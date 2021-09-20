import { v4 as uuidv4 } from 'uuid';

import { AbstractModel, AbstractEntity } from './Abstract';
import { ActionModel, ActionEntity } from './Action';
import { BattleEntity, BattleModel } from './Battle';
import { InteractionEntity, InteractionModel } from './Interaction';
import { MapSpotEntity, MapSpotModel } from './MapSpot';
import { NPCEntity, NPCModel } from './NPC';

export type OneOFNodeModel = InteractionModel | MapSpotModel | NPCModel | BattleModel;
export {
  AbstractModel, AbstractEntity,
  BattleModel, BattleEntity,
  InteractionModel, InteractionEntity,
  MapSpotModel, MapSpotEntity,
  NPCModel, NPCEntity,
  ActionModel, ActionEntity,
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<T>;

export interface DataLink extends Omit<ActionEntity, 'id' | 'toInteractionId'> {
  to: string;
}

export interface DataContainer<TEntity extends AbstractEntity> {
  type: 'MapSpot' | 'Interaction' | 'Battle' | 'NPC';
  entity: Omit<TEntity, 'id'>;
  links: DataLink[];
}

export interface DataCollection {
  data: Record<string, DataContainer<AbstractEntity>>;
  addContainer: <TEntity extends AbstractEntity>(
    type: DataContainer<TEntity>['type'],
    entity: Omit<DataContainer<TEntity>['entity'], 'interactionId'> & { interactionId?: string },
    links?: DataLink[],
  ) => DataContainer<TEntity>;
  addLink: <TEntity extends AbstractEntity>(
    container: DataContainer<TEntity>,
    link: Optional<DataLink, 'interactionId'>,
  ) => void;
}

export const createDataCollection = (): DataCollection => {
  const data: Record<string, DataContainer<AbstractEntity>> = {};

  // @TODO .какая то дичь, с типами
  const addContainer: any = <TEntity extends AbstractEntity>(
    type: DataContainer<TEntity>['type'],
    entity: Omit<DataContainer<TEntity>['entity'], 'interactionId'> & { interactionId?: string },
    links: DataLink[] = [],
  ): DataContainer<TEntity> => {
    const container = {
      type,
      entity: <TEntity>{
        interactionId: uuidv4(),
        ...entity,
      },
      links,
    };

    data[container.entity.interactionId] = container;

    return container;
  };

  const addLink = <TEntity extends AbstractEntity>(
    container: DataContainer<TEntity>,
    link: Optional<DataLink, 'interactionId'>,
  ): void => {
    container.links.push({
      interactionId: uuidv4(),
      ...link,
    });
  };

  return { data, addContainer, addLink };
};
