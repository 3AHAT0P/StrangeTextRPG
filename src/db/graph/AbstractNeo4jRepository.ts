import { Transaction, Session, QueryResult } from 'neo4j-driver-core';
import { AbstractModel, AbstractEntity } from '@db/entities/Abstract';

import {
  isNode, Node, Relationship, Integer, getIntValue,
} from './common';

export interface DBConnectionOptions {
  transaction?: Transaction;
}

export interface AbstractProperties {
  scenarioId: Integer | number;
  locationId: Integer | number;
}

export abstract class AbstractNeo4jRepository<
  TModelClass extends typeof AbstractModel,
  TModel extends AbstractModel,
  TProperties extends AbstractProperties,
> {
  protected session: Session;

  protected modelClass: TModelClass;

  protected createQuery: string = 'CREATE (a $params) RETURN a';

  protected findByIdQuery: string = 'MATCH (a) WHERE id(a) = $id RETURN a';

  protected extractFromNode(node: Node | Relationship): AbstractEntity {
    if (!isNode(node)) throw new Error('Record isn\'t Node');

    return {
      id: node.identity.toNumber(),
      scenarioId: getIntValue(node.properties.scenarioId),
      locationId: getIntValue(node.properties.locationId),
    };
  }

  protected runQuery(
    query: string, params: any, isWrite: boolean, options?: DBConnectionOptions,
  ): Promise<QueryResult> {
    if (options?.transaction != null) return options.transaction.run(query, params);

    if (isWrite) return this.session.writeTransaction((transaction) => transaction.run(query, params));

    return this.session.readTransaction((transaction) => transaction.run(query, params));
  }

  constructor(session: Session, modelClass: TModelClass) {
    this.session = session;
    this.modelClass = modelClass;
  }

  public fromRecord(node: Node): TModel {
    const data = this.extractFromNode(node);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return new (this.modelClass as any)(data);
  }

  public async create(params: TProperties, options?: DBConnectionOptions): Promise<TModel> {
    const result = await this.runQuery(this.createQuery, { params }, true, options);

    return this.fromRecord(result.records[0].get(0));
  }

  public async findById(id: number, options?: DBConnectionOptions): Promise<TModel> {
    const result = await this.runQuery(this.findByIdQuery, { id }, false, options);

    return this.fromRecord(result.records[0].get(0));
  }
}
