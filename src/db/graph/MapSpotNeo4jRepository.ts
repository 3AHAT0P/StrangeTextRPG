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
  protected label: string = ':MapSpot';

  public readonly type: string = 'MapSpot';

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

  public async getRelatedActions(id: string, options?: DBConnectionOptions): Promise<ActionModel[]> {
    const result = await this.runQuery(this.findRelatedActionsQuery, { id }, false, options);
    const actionNeo4jRepository = new ActionNeo4jRepository(this.session);
    return result.records.map((item) => actionNeo4jRepository.fromRecord(item.get(0)));
  }

  public async getSpotsAround(
    scenarioId: number, x: number, y: number, options?: DBConnectionOptions,
  ): Promise<MapSpotModel[]> {
    const result = await this.runQuery(
      `MATCH (a${this.label} { scenarioId: $scenarioId }) where a.x in $x and a.y in $y RETURN a`,
      { scenarioId, x: [x - 1, x, x + 1], y: [y - 1, y, y + 1] },
      false,
      options,
    );

    return result.records.map((item) => this.fromRecord(item.get(0)));
  }
}
