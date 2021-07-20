import { BattleModel } from './Battle';
import { InteractionModel } from './Interaction';
import { MapSpotModel } from './MapSpot';
import { NPCModel } from './NPC';

export type OneOFNodeModel = InteractionModel | MapSpotModel | NPCModel | BattleModel;
export {
  BattleModel,
  InteractionModel,
  MapSpotModel,
  NPCModel,
};
