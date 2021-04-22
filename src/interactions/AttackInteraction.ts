import { AbstractActor, AttackResult } from "../actors/AbstractActor";
import { AbstractUI, MessageType } from "../ui/AbstractUI";
import { capitalise } from "../utils/capitalise";
import { AbstractInteraction } from "./AbstractInteraction";
import { InteractionOptions, Interaction } from "./Interaction";

export interface AttackInteractionOptions extends InteractionOptions {
  attacking: AbstractActor;
  attacked: AbstractActor;
}

export class AttackInteraction extends Interaction {
  protected attacking: AbstractActor;
  protected attacked: AbstractActor;

  protected _doAttack() {
    return this.attacking.doAttack(this.attacked);
  }

  constructor(ui: AbstractUI, options: AttackInteractionOptions) {
    super(ui, options);

    this.attacking = options.attacking;
    this.attacked = options.attacked;
    if (options.messageType == null) this._messageType = 'damageDealt';
  }

  public buildMessage(attackResult: AttackResult): string {
    if (attackResult == null) return '';

    let message = `${capitalise(this.attacking.getTypeByDeclensionOfNoun('nominative'))} нанес ${capitalise(this.attacked.getTypeByDeclensionOfNoun('dative'))} ${attackResult.damage}.`;
    if (!attackResult.isAlive) message += ` ${this.attacked.getDeathMessage()}`;
    message += '\n';
    return message;
  }

  public async activate(): Promise<AbstractInteraction[]> {
    if (this._activate !== null)
      return this._activate();

    const attackResult = this._doAttack();

    const autoInteractions = this.actions.get('auto');
    if (autoInteractions != null && autoInteractions.length > 0) {
      this.ui.sendToUser(this.buildMessage(attackResult), this._messageType);
      return autoInteractions;
    }

    return super.activate();
  }
}
