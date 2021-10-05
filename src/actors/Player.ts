import {
  CanvasCoatBodyArmor,
  CanvasTrousersLegsArmor,
} from '@armor';

import {
  AbstractActorOptions,
} from './AbstractActor';
import { AbstractHumanoid } from './AbstractHumanoid';

export class Player extends AbstractHumanoid {
  protected type = 'player';

  protected declensionOfNouns = {
    nominative: 'ты',
    genitive: 'тебя',
    dative: 'тебе',
    accusative: 'тебя',
    ablative: 'тобой',
    prepositional: 'о тебе',

    possessive: 'твои',
  };

  constructor(options: AbstractActorOptions = {}) {
    super(options);

    this.maxHealthPoints = 10;
    this.healthPoints = 8;
    this.inventory.equipToSlot('body', new CanvasCoatBodyArmor());
    this.inventory.equipToSlot('legs', new CanvasTrousersLegsArmor());
  }
}
