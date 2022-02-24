import { v4 as uuidv4 } from 'uuid';

import { AbstractModel, AbstractEntity } from './Abstract';
import { ActionModel, ActionEntity } from './Action';
import { BattleDifficulty, BattleEntity, BattleModel } from './Battle';
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

export const buildBattleContainer = (
  dataCollection: DataCollection,
  baseInfo: {
    scenarioId: number;
    locationId: number;
  },
  info: {
    difficult: BattleDifficulty;
    chanceOfTriggering: number;
  },
  ioNodes: {
    input: DataContainer<AbstractEntity>;
    win: DataContainer<AbstractEntity> | string;
    lose: DataContainer<AbstractEntity> | string;
    leave?: DataContainer<AbstractEntity> | string;
  },
): void => {
  const battle = dataCollection.addContainer<BattleEntity>('Battle', {
    ...baseInfo,
    ...info,
  });

  dataCollection.addLink(ioNodes.input, {
    ...baseInfo,
    to: battle.entity.interactionId,
    text: '',
    condition: `{{battle_canTrigger "${battle.entity.interactionId}" ${battle.entity.chanceOfTriggering}}}`,
    operation: `{{battle_load "${battle.entity.interactionId}" "${battle.entity.difficult}"}}`,
    type: 'AUTO',
    subtype: 'BATTLE_START',
  });

  dataCollection.addLink(battle, {
    ...baseInfo,
    to: typeof ioNodes.win === 'string' ? ioNodes.win : ioNodes.win.entity.interactionId,
    text: '',
    type: 'AUTO',
    operation: `{{battle_updateImmune "${battle.entity.interactionId}" 10}} {{battle_unload}}`,
    subtype: 'BATTLE_WIN',
  });

  dataCollection.addLink(battle, {
    ...baseInfo,
    to: typeof ioNodes.lose === 'string' ? ioNodes.lose : ioNodes.lose.entity.interactionId,
    text: '',
    type: 'AUTO',
    operation: '{{battle_unload}}',
    subtype: 'BATTLE_LOSE',
  });

  if (ioNodes.leave != null) {
    dataCollection.addLink(battle, {
      ...baseInfo,
      to: typeof ioNodes.leave === 'string' ? ioNodes.leave : ioNodes.leave.entity.interactionId,
      text: '',
      type: 'AUTO',
      operation: '{{battle_unload}}',
      subtype: 'BATTLE_LEAVE',
    });
  }
};
