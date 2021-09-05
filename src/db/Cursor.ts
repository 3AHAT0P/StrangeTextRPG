import type { DBService } from './DBService';
import { OneOFNodeModel } from './entities';
import { ActionModel } from './entities/Action';

export interface CursorOptions {
  scenarioId: number;
  locationId?: number;
  interactionId?: string;
}

export class Cursor {
  protected currentNode: OneOFNodeModel | null = null;

  private _isInitiated: boolean = false;

  public get isInitiated(): boolean { return this._isInitiated; }

  constructor(private _dbService: DBService) {}

  public async init(options: CursorOptions): Promise<void> {
    const { scenarioId } = options;

    const locationId = options.locationId ?? 0;
    const interactionId = options.interactionId ?? '1';

    this.currentNode = await this._dbService.repositories.interactionRepo.findByParams({
      scenarioId,
      locationId,
      interactionId,
    });

    this._isInitiated = true;
  }

  getNode(): OneOFNodeModel {
    if (this.currentNode === null) throw new Error('Cursor is not initiated!');

    return this.currentNode;
  }

  getActions(): Promise<ActionModel[]> {
    const { interactionId } = this.getNode();
    return this._dbService.getRelatedActions(interactionId);
  }

  async getNextNode(action: ActionModel): Promise<OneOFNodeModel> {
    const node = await this._dbService.getNodeById(action.toInteractionId);

    if (node instanceof ActionModel) throw new Error('Node is instance of ActionModel');

    this.currentNode = node;

    return this.currentNode;
  }
}
