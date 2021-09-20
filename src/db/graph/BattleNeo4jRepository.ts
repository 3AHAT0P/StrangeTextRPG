import { BattleModel, BattleEntity, BattleDifficulty } from '@db/entities/Battle';
import { ActionModel } from '@db/entities/Action';

import {
  Node, Integer, getIntValue, EspeciallyNode, Session,
} from './common';
import { AbstractProperties, AbstractNeo4jRepository, DBConnectionOptions } from './AbstractNeo4jRepository';
import { ActionNeo4jRepository } from './ActionNeo4jRepository';

export interface BattleProperties extends AbstractProperties {
  difficult: BattleDifficulty;
  chanceOfTriggering: Integer | number;
}

export const isBattleNode = <T extends Integer>(
  value: Node<T>,
): value is EspeciallyNode<BattleProperties, T> => value.labels.includes('Battle');

export class BattleNeo4jRepository extends AbstractNeo4jRepository<
  typeof BattleModel, BattleModel, BattleProperties
> {
  protected label: string = ':Battle';

  public readonly type: string = 'Battle';

  protected extractFromNode(node: Node): BattleEntity {
    const entity = super.extractFromNode(node);
    if (!isBattleNode(node)) throw new Error('Record isn\'t BattleNode');

    return {
      ...entity,
      difficult: node.properties.difficult,
      chanceOfTriggering: getIntValue(node.properties.chanceOfTriggering),
    };
  }

  constructor(session: Session) {
    super(session, BattleModel);
  }

  public async findByParams(
    params: Partial<BattleProperties>, options?: DBConnectionOptions,
  ): Promise<BattleModel> {
    const result = await this.runQuery(this.buildFindByPropsQuery(params), params, false, options);

    return this.fromRecord(result.records[0].get(0));
  }

  public async getRelatedActions(id: number, options?: DBConnectionOptions): Promise<ActionModel[]> {
    const result = await this.runQuery(this.findRelatedActionsQuery, { id }, false, options);
    const actionNeo4jRepository = new ActionNeo4jRepository(this.session);
    return result.records.map((item) => actionNeo4jRepository.fromRecord(item.get(0)));
  }
}
