import { GameTreeNode } from "./interactions/GameTreeNode";
import { mainInteraction } from "./interactions/scenario";
import { AbstractUI } from "./ui/AbstractUI";
import { NodeUI } from "./ui/NodeUI";

const waitCorrectAnswer = async (ui: AbstractUI, nodeList: GameTreeNode[]): Promise<GameTreeNode> => {
  let nextNode = null;
  while (nextNode == null) {
    try {
      const userChoise = await ui.waitInteraction();
      nextNode = nodeList[userChoise - 1];
    } catch (error) {
      // pass
    }
  }
  return nextNode;
}

const treeTraversal = async (ui: AbstractUI, node: GameTreeNode): Promise<void> => {
  const childNodeList = Array.from(node.actions.values());
  let nextNode = null;
  try {
    const userChoise = await ui.interactWithUser(
      [node.message],
      Array.from(node.actions.keys()),
    );
    nextNode = childNodeList[userChoise - 1];
    if (nextNode == null) throw new Error('Answer is incorrect');
  } catch (error) {
    nextNode = await waitCorrectAnswer(ui, childNodeList);
  }
  setTimeout(treeTraversal, 16, ui, nextNode);
}

const main = async () => {
  const ui = new NodeUI();
  await treeTraversal(ui, mainInteraction);
}

main();
