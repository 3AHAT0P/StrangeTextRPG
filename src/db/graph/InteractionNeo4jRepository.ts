import { InteractionModel, InteractionEntity } from '@db/entities/Interaction';
import { ActionModel } from '@db/entities/Action';

import {
  Node, Integer, getIntValue, EspeciallyNode, Session,
} from './common';
import { AbstractProperties, AbstractNeo4jRepository, DBConnectionOptions } from './AbstractNeo4jRepository';
import { ActionNeo4jRepository } from './ActionNeo4jRepository';

export interface InteractionProperties extends AbstractProperties {
  interactionId: number;
  text: string;
}

export const isInteractionNode = <T extends Integer>(
  value: Node<T>,
): value is EspeciallyNode<InteractionProperties, T> => value.labels.includes('Interaction');

export class InteractionNeo4jRepository extends AbstractNeo4jRepository<
  typeof InteractionModel, InteractionModel, InteractionProperties
> {
  protected createQuery: string = 'CREATE (a:Interaction $params) RETURN a';

  protected findByIdQuery: string = 'MATCH (a:Interaction) WHERE id(a) = $id RETURN a';

  protected findRelatedActionsQuery: string = 'MATCH (a:Interaction)-[r:Action]->(b) WHERE id(a) = $id RETURN r';

  protected buildFindByPropsQuery(params: Partial<InteractionProperties>): string {
    const keys = Object.keys(params);
    let query = 'MATCH (a:Interaction';
    if (keys.length > 0) {
      query += ' { ';
      query += Object.keys(params)
        .map((key) => `${key}: $${key}`)
        .join(', ');
      query += ' }';
    }
    query += ') RETURN a';
    return query;
  }

  protected extractFromNode(node: Node): InteractionEntity {
    const entity = super.extractFromNode(node);
    if (!isInteractionNode(node)) throw new Error('Record isn\'t InteractionNode');

    return {
      ...entity,
      interactionId: getIntValue(node.properties.interactionId),
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
