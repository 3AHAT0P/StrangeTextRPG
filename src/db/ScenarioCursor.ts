import {
  Driver, Session,
} from 'neo4j-driver';

import { ActionNeo4jRepository } from './graph/ActionNeo4jRepository';
import { InteractionNeo4jRepository } from './graph/InteractionNeo4jRepository';
import { InteractionModel } from './entities/Interaction';
import { ActionModel } from './entities/Action';

export interface ScenarioCursorOptions {
  scenarioId: number;
  locationId?: number;
  interactionId?: number;
}

export class ScenarioCursor {
  protected session: Session;

  protected repositories: {
    actionNeo4jRepository: ActionNeo4jRepository;
    interactionNeo4jRepository: InteractionNeo4jRepository;
  };

  protected currentInteraction: InteractionModel | null = null;

  constructor(private _driver: Driver) {
    this.session = this._driver.session();

    this.repositories = <const>{
      actionNeo4jRepository: new ActionNeo4jRepository(this.session),
      interactionNeo4jRepository: new InteractionNeo4jRepository(this.session),
    };
  }

  public async init(options: ScenarioCursorOptions): Promise<void> {
    const { scenarioId } = options;

    const locationId = options.locationId ?? 0;
    const interactionId = options.interactionId ?? 1;

    this.currentInteraction = await this.repositories.interactionNeo4jRepository.findByParams({
      scenarioId,
      locationId,
      interactionId,
    });
  }

  public destroy(): Promise<void> {
    return this.session.close();
  }

  getInteraction(): InteractionModel {
    if (this.currentInteraction === null) throw new Error('Cursor is not initiated!');

    return this.currentInteraction;
  }

  getActions(): Promise<ActionModel[]> {
    const { id } = this.getInteraction();
    return this.repositories.interactionNeo4jRepository.getRelatedActions(id);
  }

  async getNextInteraction(action: ActionModel): Promise<InteractionModel> {
    this.currentInteraction = await this.repositories.interactionNeo4jRepository.findById(action.toInteractionId);

    return this.currentInteraction;
  }
}
