import { NPCModel, NPCEntity, NPCSubtype } from '@db/entities/NPC';
import { ActionModel } from '@db/entities/Action';

import {
  Node, Integer, getIntValue, EspeciallyNode, Session,
} from './common';
import { AbstractProperties, AbstractNeo4jRepository, DBConnectionOptions } from './AbstractNeo4jRepository';
import { ActionNeo4jRepository } from './ActionNeo4jRepository';

export interface NPCProperties extends AbstractProperties {
  NPCId: Integer | number;
  subtype: NPCSubtype;
}

export const isNPCNode = <T extends Integer>(
  value: Node<T>,
): value is EspeciallyNode<NPCProperties, T> => value.labels.includes('NPC');

export class NPCNeo4jRepository extends AbstractNeo4jRepository<
  typeof NPCModel, NPCModel, NPCProperties
> {
  protected createQuery: string = 'CREATE (a:NPC $params) RETURN a';

  protected findByIdQuery: string = 'MATCH (a:NPC) WHERE id(a) = $id RETURN a';

  protected findRelatedActionsQuery: string = 'MATCH (a:NPC)-[r:Action]->(b) WHERE id(a) = $id RETURN r';

  protected buildFindByPropsQuery(params: Partial<NPCProperties>): string {
    const keys = Object.keys(params);
    let query = 'MATCH (a:NPC';
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

  protected extractFromNode(node: Node): NPCEntity {
    const entity = super.extractFromNode(node);
    if (!isNPCNode(node)) throw new Error('Record isn\'t NPCNode');

    return {
      ...entity,
      NPCId: getIntValue(node.properties.NPCId),
      subtype: node.properties.subtype,
    };
  }

  constructor(session: Session) {
    super(session, NPCModel);
  }

  public async findByParams(
    params: Partial<NPCProperties>, options?: DBConnectionOptions,
  ): Promise<NPCModel> {
    const result = await this.runQuery(this.buildFindByPropsQuery(params), params, false, options);

    return this.fromRecord(result.records[0].get(0));
  }

  public async getRelatedActions(id: number, options?: DBConnectionOptions): Promise<ActionModel[]> {
    const result = await this.runQuery(this.findRelatedActionsQuery, { id }, false, options);
    const actionNeo4jRepository = new ActionNeo4jRepository(this.session);
    return result.records.map((item) => actionNeo4jRepository.fromRecord(item.get(0)));
  }
}
