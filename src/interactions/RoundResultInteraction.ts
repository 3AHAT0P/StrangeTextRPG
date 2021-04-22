import { AbstractActor } from "../actors/AbstractActor";
import { AbstractUI } from "../ui/AbstractUI";
import { AbstractInteraction } from "./AbstractInteraction";
import { Interaction, InteractionOptions } from "./Interaction";

export interface RoundResultInteractionOptions extends InteractionOptions {
  actors: AbstractActor[];
}

export class RoundResultInteraction extends Interaction {
  protected actors: AbstractActor[];

  constructor(ui: AbstractUI, options: RoundResultInteractionOptions) {
    super(ui, options);

    this.actors = options.actors;
    if (options.messageType == null)
      this._messageType = 'stats';
  }

  public buildMessage(): string {
    this.ui.sendToUser('Результаты раунда:\n', 'default');
    this.actors.forEach((actor: AbstractActor) => {
      this.ui.sendToUser(`У ${actor.getTypeByDeclensionOfNoun('genitive')} ${actor.healthPoints} ОЗ;\n`, 'stats');
    });
    this.ui.sendToUser('Что будешь делать?\n', 'default');

    return '';
  }

  public async activate(): Promise<AbstractInteraction> {
    if (this._activate !== null)
      return this._activate();

    const autoInteractions = this.actions.get('auto');
    if (autoInteractions != null) {
      this.buildMessage();
      return autoInteractions;
    }

    return super.activate();
  }
}
