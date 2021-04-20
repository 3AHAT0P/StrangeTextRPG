import { Player } from "./actors/Player";
import { Rat } from "./actors/Rat";
import { AbstractInteraction } from "./interactions/AbstractInteraction";
import { battleInteractionBuilder, initializeInteractions } from "./interactions/scenario";
import { AbstractUI } from "./ui/AbstractUI";
import { NodeUI } from "./ui/NodeUI";

const treeTraversal = async (ui: AbstractUI, interaction: AbstractInteraction): Promise<void> => {
  const nextInteractions: AbstractInteraction[] = await interaction.activate();
  // что делать с остальными интеракциями в массиве?
  setTimeout(treeTraversal, 16, ui, nextInteractions[0]);
}

const main = async () => {
  const ui = new NodeUI();
  // const interactions = initializeInteractions(ui);
  const player = new Player();
  const rat1 = new Rat();
  const rat2 = new Rat();
  const interactions = battleInteractionBuilder(ui, player, rat1, rat2);
  await treeTraversal(ui, interactions.mainInteraction);
}

main();
