import neo4j from 'neo4j-driver';

import { getConfig } from 'ConfigProvider';
import { DIProducer } from '@utils/DI';

import {
  Driver, Session,
  Node, Relationship,
  isNode, isRelationship,
} from './graph/common';
import { InteractionNeo4jRepository, isInteractionNode } from './graph/InteractionNeo4jRepository';
import { ActionNeo4jRepository, isActionRelationship } from './graph/ActionNeo4jRepository';
import { isMapSpotNode, MapSpotNeo4jRepository } from './graph/MapSpotNeo4jRepository';
import { isNPCNode, NPCNeo4jRepository } from './graph/NPCNeo4jRepository';
import { BattleNeo4jRepository, isBattleNode } from './graph/BattleNeo4jRepository';
import { ActionModel } from './entities/Action';
import { OneOFNodeModel } from './entities';

const config = getConfig();

export { Driver, Session };

export const buildDriver = (): Driver => (
  neo4j.driver(config.NEO4J_URL, neo4j.auth.basic(config.NEO4J_LOGIN, config.NEO4J_PASSWORD))
);

export interface RepositoriesHash {
  interactionRepo: InteractionNeo4jRepository;
  actionRepo: ActionNeo4jRepository;
  mapSpotRepo: MapSpotNeo4jRepository;
  npcRepo: NPCNeo4jRepository;
  battleRepo: BattleNeo4jRepository;
}

export type OneOfConcreteRepository = RepositoriesHash[keyof RepositoriesHash];

@DIProducer()
export class DBService {
  private _driver: Driver;

  private _session: Session;

  public readonly repositories: RepositoriesHash;

  protected getRepoByRecordItem(recordItem: Node | Relationship): OneOfConcreteRepository | null {
    if (isNode(recordItem)) {
      if (isInteractionNode(recordItem)) return this.repositories.interactionRepo;
      if (isBattleNode(recordItem)) return this.repositories.battleRepo;
      if (isMapSpotNode(recordItem)) return this.repositories.mapSpotRepo;
      if (isNPCNode(recordItem)) return this.repositories.npcRepo;
    } else if (isRelationship(recordItem)) {
      if (isActionRelationship(recordItem)) return this.repositories.actionRepo;
    }

    return null;
  }

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

  public async getNodeById(id: number): Promise<OneOFNodeModel> {
    const result = await this._session.readTransaction(
      (transaction) => transaction.run('MATCH (a) WHERE id(a) = $id RETURN a', { id }),
    );

    const record = result.records[0].get(0);

    const repo = this.getRepoByRecordItem(record);

    if (repo === null || repo instanceof ActionNeo4jRepository) throw new Error('Type of node is incorrect');

    return repo.fromRecord(record);
  }

  public async getRelatedActions(id: number): Promise<ActionModel[]> {
    const result = await this._session.readTransaction(
      (transaction) => transaction.run('MATCH (a)-[r:Action]->(b) WHERE id(a) = $id RETURN r', { id }),
    );

    return result.records.map((item) => this.repositories.actionRepo.fromRecord(item.get(0)));
  }

  public async runRawQuery(query: string, params: any) {
    const result = await this._session.readTransaction(
      (transaction) => transaction.run(query, params),
    );

    return result.records;
  }
}
