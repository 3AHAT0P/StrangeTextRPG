import { InteractionModel, InteractionEntity } from '@db/entities/Interaction';
import { ActionModel } from '@db/entities/Action';

import {
  Node, Integer, getIntValue, EspeciallyNode, Session,
} from './common';
import { AbstractProperties, AbstractNeo4jRepository, DBConnectionOptions } from './AbstractNeo4jRepository';
import { ActionNeo4jRepository } from './ActionNeo4jRepository';

export interface InteractionProperties extends AbstractProperties {
  text: string;
}

export const isInteractionNode = <T extends Integer>(
  value: Node<T>,
): value is EspeciallyNode<InteractionProperties, T> => value.labels.includes('Interaction');

export class InteractionNeo4jRepository extends AbstractNeo4jRepository<
  typeof InteractionModel, InteractionModel, InteractionProperties
> {
  protected label: string = ':Interaction';

  public readonly type: string = 'Interaction';

  protected extractFromNode(node: Node): InteractionEntity {
    const entity = super.extractFromNode(node);
    if (!isInteractionNode(node)) throw new Error('Record isn\'t InteractionNode');

    return {
      ...entity,
      text: node.properties.text,
    };
  }

  constructor(session: Session) {
    super(session, InteractionModel);
  }

  public async findByParams(
    params: Partial<InteractionProperties>, options?: DBConnectionOptions,
  ): Promise<InteractionModel> {
    const result = await this.runQuery(this.buildFindByPropsQuery(params), params, false, options);

    return this.fromRecord(result.records[0].get(0));
  }

  public async getRelatedActions(id: number, options?: DBConnectionOptions): Promise<ActionModel[]> {
    const result = await this.runQuery(this.findRelatedActionsQuery, { id }, false, options);
    const actionNeo4jRepository = new ActionNeo4jRepository(this.session);
    return result.records.map((item) => actionNeo4jRepository.fromRecord(item.get(0)));
  }
}
