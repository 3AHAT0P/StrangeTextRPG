import { Transaction, Session } from 'neo4j-driver-core';
import { ActionEntity, ActionRelationshipProperties, extractActionEntityFromRelationship } from './ActionRelationship';

import {
  isNode, Node, EspeciallyNode, NRecord, Integer, getIntValue,
} from './common';

export interface InteractionNodeProperties {
  scenarioId: Integer;
  locationId: Integer;
  interactionId: Integer;
  text: string;
}

export interface InteractionEntity {
  id: number;
  scenarioId: number;
  locationId: number;
  interactionId: number;
  text: string;
}

export const isInteractionNode = <T extends Integer>(
  value: Node<T>,
): value is EspeciallyNode<InteractionNodeProperties, T> => value.labels.includes('Interaction');

export const extractInteractionEntityFromNode = (record: NRecord): InteractionEntity => {
  const data = record.get(0);
  if (!isNode(data)) throw new Error('Record isn\'t Node');
  if (!isInteractionNode(data)) throw new Error('Record isn\'t InteractionNode');

  return {
    id: data.identity.toNumber(),
    scenarioId: getIntValue(data.properties.scenarioId),
    locationId: getIntValue(data.properties.locationId),
    interactionId: getIntValue(data.properties.interactionId),
    text: data.properties.text,
  };
};

type ModelState = 'NEW' | 'SAVED' | 'DIRTY';
const QUERIES = <const>{
  CREATE: `
    CREATE (a: Interaction { scenarioId: $scenarioId, locationId: $locationId, interactionId: $interactionId, text: $text })
    RETURN a
  `,
  FIND_BY_ID: `
    MATCH (a: Interaction)
    WHERE id(a) = $id
    RETURN a
  `,
  ADD_RELATION: `
    MATCH (a: Interaction)
    WHERE id(a) = $from

    MATCH (b: Interaction)
    WHERE id(b) = $to

    CREATE (a)-[r: Action { scenarioId: $scenarioId, locationId: $locationId, text: $text, type: $type }]->(b)

    RETURN r
  `,
};

interface DBConnectionOptions {
  transaction?: Transaction;
}

export class InteractionModel implements InteractionEntity {
  static session: Session;

  static async create(params: InteractionNodeProperties, options?: DBConnectionOptions): Promise<InteractionModel> {
    const result = options?.transaction != null
      ? await options.transaction.run(QUERIES.CREATE, params)
      : await this.session.writeTransaction((transaction) => transaction.run(QUERIES.CREATE, params));

    return this.fromRecord(result.records[0]);
  }

  static async findById(id: number, options?: DBConnectionOptions): Promise<InteractionModel> {
    const result = options?.transaction != null
      ? await options.transaction.run(QUERIES.FIND_BY_ID, { id })
      : await this.session.readTransaction((transaction) => transaction.run(QUERIES.FIND_BY_ID, { id }));

    return this.fromRecord(result.records[0]);
  }

  static fromRecord(record: NRecord): InteractionModel {
    const data = extractInteractionEntityFromNode(record);

    return new this(data);
  }

  static async createRelationBetween(
    from: InteractionModel, to: InteractionModel, params: ActionRelationshipProperties, options?: DBConnectionOptions,
  ): Promise<ActionEntity> {
    const finalParams = {
      ...params,
      from: from.id,
      to: to.id,
    };
    const result = options?.transaction != null
      ? await options.transaction.run(QUERIES.ADD_RELATION, finalParams)
      : await this.session.readTransaction((transaction) => transaction.run(QUERIES.ADD_RELATION, finalParams));

    return extractActionEntityFromRelationship(result.records[0]);
  }

  protected _state: ModelState = 'NEW';

  protected _id: number;

  public get id(): number { return this._id; }

  public readonly scenarioId: number;

  public readonly locationId: number;

  public readonly interactionId: number;

  public readonly text: string;

  constructor(data: InteractionEntity) {
    this._id = data.id;
    this.scenarioId = data.scenarioId;
    this.locationId = data.locationId;
    this.interactionId = data.interactionId;
    this.text = data.text;
  }

  async addAction(to: InteractionModel, params: ActionRelationshipProperties): Promise<ActionEntity> {
    return InteractionModel.createRelationBetween(this, to, params);
  }
}
