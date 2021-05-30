import {
  Transaction, Driver, Session,
} from 'neo4j-driver';

import { ActionEntity, extractActionEntityFromRelationship } from './graph/ActionRelationship';
import { InteractionEntity, InteractionModel } from './graph/InteractionNode';

export interface ScenarioCursorOptions {
  scenarioId: number;
  locationId?: number;
  interactionId?: number;
}

const QUERIES = <const>{
  findInteractionByProps: 'MATCH (a: Interaction) WHERE a.scenarioId = $scenarioId and a.locationId = $locationId and a.interactionId = $interactionId RETURN a',
};

export class ScenarioCursor {
  protected session: Session;

  protected currentInteraction: InteractionModel | null = null;

  constructor(private _driver: Driver) {
    this.session = this._driver.session();
    InteractionModel.session = this.session;
  }

  public async init(options: ScenarioCursorOptions): Promise<void> {
    const { scenarioId } = options;

    const locationId = options.locationId ?? 0;
    const interactionId = options.interactionId ?? 1;

    const result = await this.session.readTransaction(
      (tx: Transaction) => tx.run(
        QUERIES.findInteractionByProps,
        {
          scenarioId,
          locationId,
          interactionId,
        },
      ),
    );

    this.currentInteraction = InteractionModel.fromRecord(result.records[0]);
  }

  public destroy(): Promise<void> {
    return this.session.close();
  }

  getInteraction(): InteractionEntity {
    if (this.currentInteraction === null) throw new Error('Cursor is not initiated!');

    return this.currentInteraction;
  }

  async getActions(): Promise<ActionEntity[]> {
    const { id } = this.getInteraction();
    const result = await this.session.readTransaction(
      (tx: Transaction) => tx.run('MATCH (a: Interaction)-[r: Action]->(b) WHERE id(a) = $id RETURN r', { id }),
    );

    if (result.records.length === 0) throw new Error('Result list is empty');

    return result.records.map(extractActionEntityFromRelationship);
  }

  async getNextInteraction(action: ActionEntity): Promise<InteractionEntity> {
    this.currentInteraction = await InteractionModel.findById(action.toInteractionId);

    return this.currentInteraction;
  }
}
