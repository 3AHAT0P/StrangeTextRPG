import type { DBService } from './DBService';
import { MapSpotModel, OneOFNodeModel } from './entities';
import { ActionModel } from './entities/Action';
import { InteractionProperties } from './graph/InteractionNeo4jRepository';

export interface CursorOptions {
  scenarioId: number;
  locationId?: number;
  interactionId?: string;
  isStart?: boolean;
}

export class Cursor {
  protected currentNode: OneOFNodeModel | null = null;

  private _isInitiated: boolean = false;

  public get isInitiated(): boolean { return this._isInitiated; }

  constructor(private _dbService: DBService) {}

  public async init(options: CursorOptions): Promise<void> {
    const { scenarioId } = options;

    const params: Partial<InteractionProperties> = { scenarioId };

    if (options.locationId != null) params.locationId = options.locationId;
    if (options.interactionId != null) params.interactionId = options.interactionId;
    params.isStart = options.isStart ?? true;

    this.currentNode = await this._dbService.repositories.interactionRepo.findByParams(params);

    this._isInitiated = true;
  }

  public getNode(): OneOFNodeModel {
    if (this.currentNode === null) throw new Error('Cursor is not initiated!');

    return this.currentNode;
  }

  public getActions(): Promise<ActionModel[]> {
    const { interactionId } = this.getNode();
    return this._dbService.getRelatedActions(interactionId);
  }

  public async getNextNode(action: ActionModel): Promise<OneOFNodeModel> {
    const node = await this._dbService.getNodeById(action.toInteractionId);

    if (node instanceof ActionModel) throw new Error('Node is instance of ActionModel');

    this.currentNode = node;

    return this.currentNode;
  }

  public nodeIsEqual(node: OneOFNodeModel): boolean {
    return this.currentNode === node;
  }

  public jumpToNode(node: OneOFNodeModel): void {
    this.currentNode = node;
  }

  public getSpotsAround(mapSpot: MapSpotModel): Promise<MapSpotModel[]> {
    return this._dbService.repositories.mapSpotRepo.getSpotsAround(mapSpot.scenarioId, mapSpot.x, mapSpot.y);
  }
}
