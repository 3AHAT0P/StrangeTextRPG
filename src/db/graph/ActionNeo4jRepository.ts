import {
  ActionModel, ActionEntity, ActionType, ActionSubtype,
} from '@db/entities/Action';

import {
  isRelationship, Relationship, Integer, EspeciallyRelationship, Session,
} from './common';
import { AbstractProperties, AbstractNeo4jRepository, DBConnectionOptions } from './AbstractNeo4jRepository';

export interface ActionProperties extends AbstractProperties {
  toInteractionId: string;
  text: string;
  type: ActionType;
  subtype: ActionSubtype;
  condition?: string;
  operation?: string;
  isPrintable?: boolean;
}

export const isActionRelationship = <T extends Integer>(
  value: Relationship<T>,
): value is EspeciallyRelationship<ActionProperties, T> => value.type.toLowerCase() === 'action';

export class ActionNeo4jRepository extends AbstractNeo4jRepository<typeof ActionModel, ActionModel, ActionProperties> {
  protected label: string = ':Action';

  protected get createQuery(): string {
    return `
      MATCH (a)
      WHERE id(a) = $from

      MATCH (b)
      WHERE id(b) = $to

      CREATE (a)-[r:Action $params]->(b)

      RETURN r
    `;
  }

  protected get findByInternalIdQuery(): string { return 'MATCH ()-[r:Action]->() WHERE id(r) = $id RETURN r'; }

  protected get findByIdQuery(): string { return 'MATCH ()-[r:Action]->() WHERE r.interactionId = $id RETURN r'; }

  public readonly type: string = 'Action';

  protected extractFromNode(node: Relationship): ActionEntity {
    if (!isRelationship(node)) throw new Error('Record isn\'t Relationship');
    if (!isActionRelationship(node)) throw new Error('Record isn\'t ActionRelationship');

    return {
      id: node.identity.toNumber(),
      scenarioId: node.properties.scenarioId,
      locationId: node.properties.locationId,
      interactionId: node.properties.interactionId,
      toInteractionId: node.properties.toInteractionId,
      text: node.properties.text,
      type: node.properties.type,
      subtype: node.properties.subtype,
      condition: node.properties.condition,
      operation: node.properties.operation,
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
