import { PlayerAction } from "./constants";
import { Player } from "./player";

interface BaseGameTreeNode {
  pot: number;
  parent: GameTreeNode | null;
  children: { [key in PlayerAction]?: GameTreeNode };
}

class DecisionNode implements BaseGameTreeNode {
  pot: number;
  parent: GameTreeNode | null;
  children: { [key in PlayerAction]?: GameTreeNode };

  constructor(pot: number, parent: GameTreeNode | null) {
    this.pot = pot;
    this.parent = parent;
    this.children = {};
  }

  availableActions(): PlayerAction[] {
    return [PlayerAction.Bet, PlayerAction.Check];
  }
}

class ResponseNode implements BaseGameTreeNode {
  pot: number;
  parent: GameTreeNode | null;
  children: { [key in PlayerAction]?: GameTreeNode };

  constructor(pot: number, parent: GameTreeNode | null) {
    this.pot = pot;
    this.parent = parent;
    this.children = {};
  }

  availableActions(): PlayerAction[] {
    return [PlayerAction.Call, PlayerAction.Fold];
  }
}

export class TerminalNode implements BaseGameTreeNode {
  pot: number;
  parent: GameTreeNode | null;
  children: { [key in PlayerAction]?: GameTreeNode };

  constructor(pot: number, parent: GameTreeNode | null) {
    this.pot = pot;
    this.parent = parent;
    this.children = {};
  }

  availableActions(): PlayerAction[] {
    return []; // No actions possible in a terminal node
  }
}

export type GameTreeNode = DecisionNode | ResponseNode | TerminalNode;

export class GameTree {
  p1: Player;
  p2: Player;
  root: GameTreeNode;

  constructor(p1: Player, p2: Player) {
    this.p1 = p1;
    this.p2 = p2;

    // Each player antes 1
    this.p1.bet++;
    this.p2.bet++;

    const node = new DecisionNode(null, 2);
    this.root = this.buildGameTree(node);
  }

  // buildGameTree(current: GameTreeNode, p1: Player, p2: Player): GameTreeNode {
  buildGameTree(current: GameTreeNode): GameTreeNode {
    if (current instanceof TerminalNode) {
      return current;
    }

    // const nextPlayer = current.player === p1 ? p2 : p1;

    for (const action of current.availableActions()) {
      let nextNode: GameTreeNode;
      if (action === PlayerAction.Bet) {
        nextNode = new ResponseNode(current.pot + 1, current);
      } else if (action === PlayerAction.Call || action === PlayerAction.Fold) {
        nextNode = new TerminalNode(current.pot, current);
        // Both Players checked
      } else if (
        current.parent instanceof DecisionNode &&
        action === PlayerAction.Check
      ) {
        nextNode = new TerminalNode(current.pot, current);
      } else {
        nextNode = new DecisionNode(current.pot, current);
      }

      current.children[action] = this.buildGameTree(nextNode);
    }

    return current;
  }
}
