import { Transaction, Session, QueryResult } from 'neo4j-driver-core';
import { AbstractModel, AbstractEntity } from '@db/entities/Abstract';

import {
  isNode, Node, Relationship,
} from './common';

export interface DBConnectionOptions {
  transaction?: Transaction;
}

export interface AbstractProperties {
  scenarioId: number;
  locationId: number;
  interactionId: string;
}

export abstract class AbstractNeo4jRepository<
  TModelClass extends typeof AbstractModel,
  TModel extends AbstractModel,
  TProperties extends AbstractProperties,
> {
  protected session: Session;

  protected modelClass: TModelClass;

  protected abstract label: string;

  protected get createQuery(): string { return `CREATE (a${this.label} $params) RETURN a`; }

  protected get findByInternalIdQuery(): string { return `MATCH (a${this.label}) WHERE id(a) = $id RETURN a`; }

  protected get findByIdQuery(): string { return `MATCH (a${this.label} { interactionId: $id }) RETURN a`; }

  protected get findRelatedActionsQuery(): string {
    return `MATCH (a${this.label} { interactionId: $id })-[r:Action]->(b) RETURN r`;
  }

  protected buildFindByPropsQuery(params: Partial<TProperties>): string {
    const keys = Object.keys(params);
    let query = `MATCH (a:${this.label}`;
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

  public abstract readonly type: string;

  protected extractFromNode(node: Node | Relationship): AbstractEntity {
    if (!isNode(node)) throw new Error('Record isn\'t Node');

    return {
      id: node.identity.toNumber(),
      scenarioId: node.properties.scenarioId,
      locationId: node.properties.locationId,
      interactionId: node.properties.interactionId,
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

  public fromRecord(node: Node | Relationship): TModel {
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
