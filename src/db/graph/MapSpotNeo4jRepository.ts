import { MapSpotModel, MapSpotEntity, MapSpotSubtype } from '@db/entities/MapSpot';
import { ActionModel } from '@db/entities/Action';

import {
  Node, Integer, getIntValue, EspeciallyNode, Session,
} from './common';
import { AbstractProperties, AbstractNeo4jRepository, DBConnectionOptions } from './AbstractNeo4jRepository';
import { ActionNeo4jRepository } from './ActionNeo4jRepository';

export interface MapSpotProperties extends AbstractProperties {
  x: Integer | number;
  y: Integer | number;
  subtype: MapSpotSubtype;
  isThroughable: boolean;
}

export const isMapSpotNode = <T extends Integer>(
  value: Node<T>,
): value is EspeciallyNode<MapSpotProperties, T> => value.labels.includes('MapSpot');

export class MapSpotNeo4jRepository extends AbstractNeo4jRepository<
  typeof MapSpotModel, MapSpotModel, MapSpotProperties
> {
  protected createQuery: string = 'CREATE (a:MapSpot $params) RETURN a';

  protected findByIdQuery: string = 'MATCH (a:MapSpot) WHERE id(a) = $id RETURN a';

  protected findRelatedActionsQuery: string = 'MATCH (a:MapSpot)-[r:Action]->(b) WHERE id(a) = $id RETURN r';

  public readonly type: string = 'MapSpot';

  protected buildFindByPropsQuery(params: Partial<MapSpotProperties>): string {
    const keys = Object.keys(params);
    let query = 'MATCH (a:MapSpot';
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

  protected extractFromNode(node: Node): MapSpotEntity {
    const entity = super.extractFromNode(node);
    if (!isMapSpotNode(node)) throw new Error('Record isn\'t MapSpotNode');

    return {
      ...entity,
      x: getIntValue(node.properties.x),
      y: getIntValue(node.properties.y),
      subtype: node.properties.subtype,
      isThroughable: node.properties.isThroughable,
    };
  }

  constructor(session: Session) {
    super(session, MapSpotModel);
  }

  public async findByParams(
    params: Partial<MapSpotProperties>, options?: DBConnectionOptions,
  ): Promise<MapSpotModel> {
    const result = await this.runQuery(this.buildFindByPropsQuery(params), params, false, options);

    return this.fromRecord(result.records[0].get(0));
  }

  public async getRelatedActions(id: number, options?: DBConnectionOptions): Promise<ActionModel[]> {
    const result = await this.runQuery(this.findRelatedActionsQuery, { id }, false, options);
    const actionNeo4jRepository = new ActionNeo4jRepository(this.session);
    return result.records.map((item) => actionNeo4jRepository.fromRecord(item.get(0)));
  }
}
