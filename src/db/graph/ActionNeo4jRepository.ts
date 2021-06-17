import { ActionModel, ActionEntity } from '@db/entities/Action';

import {
  isRelationship, Relationship, Integer, getIntValue, EspeciallyRelationship, Session,
} from './common';
import { AbstractProperties, AbstractNeo4jRepository, DBConnectionOptions } from './AbstractNeo4jRepository';

export interface ActionProperties extends AbstractProperties {
  text: string;
  type: 'SYSTEM' | 'AUTO' | 'CUSTOM';
  isPrintable?: boolean;
}

export const isActionRelationship = <T extends Integer>(
  value: Relationship<T>,
): value is EspeciallyRelationship<ActionProperties, T> => value.type.toLowerCase() === 'action';

export class ActionNeo4jRepository extends AbstractNeo4jRepository<typeof ActionModel, ActionModel, ActionProperties> {
  protected createQuery: string = `
    MATCH (a)
    WHERE id(a) = $from

    MATCH (b)
    WHERE id(b) = $to

    CREATE (a)-[r:Action $params]->(b)

    RETURN r
  `;

  protected findByIdQuery: string = 'MATCH ()-[r:Action]->() WHERE id(r) = $id RETURN r';

  public readonly type: string = 'Action';

  protected extractFromNode(node: Relationship): ActionEntity {
    if (!isRelationship(node)) throw new Error('Record isn\'t Relationship');
    if (!isActionRelationship(node)) throw new Error('Record isn\'t ActionRelationship');

    return {
      id: node.identity.toNumber(),
      scenarioId: getIntValue(node.properties.scenarioId),
      locationId: getIntValue(node.properties.locationId),
      fromInteractionId: node.start.toNumber(),
      toInteractionId: node.end.toNumber(),
      text: node.properties.text,
      type: node.properties.type,
      isPrintable: node.properties.isPrintable ?? false,
    };
  }

  constructor(session: Session) {
    super(session, ActionModel);
  }

  public async create(
    params: ActionProperties & { from: number, to: number }, options?: DBConnectionOptions,
  ): Promise<ActionModel> {
    const { from, to, ...otherParams } = params;
    otherParams.isPrintable = otherParams.isPrintable ?? false;
    const result = await this.runQuery(this.createQuery, { from, to, params: otherParams }, true, options);

    return this.fromRecord(result.records[0].get(0));
  }
}
