import { buildDriver, Driver, Session } from '@db';
import { InteractionNeo4jRepository } from '@db/graph/InteractionNeo4jRepository';
import { ActionNeo4jRepository } from '@db/graph/ActionNeo4jRepository';
import { MapSpotNeo4jRepository } from '@db/graph/MapSpotNeo4jRepository';
import { NPCNeo4jRepository } from '@db/graph/NPCNeo4jRepository';
import { BattleNeo4jRepository } from '@db/graph/BattleNeo4jRepository';

export class DBService {
  private _driver: Driver;

  private _session: Session;

  public readonly repositories: {
    interactionRepo: InteractionNeo4jRepository;
    actionRepo: ActionNeo4jRepository;
    mapSpotRepo: MapSpotNeo4jRepository;
    npcRepo: NPCNeo4jRepository;
    battleRepo: BattleNeo4jRepository;
  };

  constructor() {
    this._driver = buildDriver();
    this._session = this._driver.session();

    this.repositories = {
      interactionRepo: new InteractionNeo4jRepository(this._session),
      actionRepo: new ActionNeo4jRepository(this._session),
      mapSpotRepo: new MapSpotNeo4jRepository(this._session),
      npcRepo: new NPCNeo4jRepository(this._session),
      battleRepo: new BattleNeo4jRepository(this._session),
    };
  }

  public async destructor(): Promise<void> {
    await this._session.close();
    await this._driver.close();
  }
}
