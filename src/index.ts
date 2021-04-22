import { Player } from "./actors/Player";
import { AbstractInteraction } from "./interactions/AbstractInteraction";
import { buildFirstLocation, buildSecondLocation } from "./interactions/scenario";
import { AbstractUI } from "./ui/AbstractUI";
import { NodeUI } from "./ui/NodeUI";

const treeTraversal = async (ui: AbstractUI, interaction: AbstractInteraction): Promise<void> => {
  const nextInteractions: AbstractInteraction = await interaction.activate();
  setTimeout(treeTraversal, 16, ui, nextInteractions);
}

const main = async () => {
  const ui = new NodeUI();
  const player = new Player();

  const firstLocation = buildFirstLocation(ui, player, buildSecondLocation(ui, player));

  await treeTraversal(ui, firstLocation);
}

main();
