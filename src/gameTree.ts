import { Action } from "./constants";

interface BaseGameTreeNode {
  pot: number;
  lastAction: Action | null;
  parent: GameTreeNode | null;
  children: { [key in Action]?: GameTreeNode };
}

class DecisionNode implements BaseGameTreeNode {
  pot: number;
  lastAction: Action | null;
  parent: GameTreeNode | null;
  children: { [key in Action]?: GameTreeNode };

  constructor(
    pot: number,
    lastAction: Action | null,
    parent: GameTreeNode | null
  ) {
    this.pot = pot;
    this.lastAction = lastAction;
    this.parent = parent;
    this.children = {};
  }

  availableActions(): Action[] {
    return [Action.Bet, Action.Check];
  }
}

class ResponseNode implements BaseGameTreeNode {
  pot: number;
  lastAction: Action | null;
  parent: GameTreeNode | null;
  children: { [key in Action]?: GameTreeNode };

  constructor(
    pot: number,
    lastAction: Action | null,
    parent: GameTreeNode | null
  ) {
    this.pot = pot;
    this.lastAction = lastAction;
    this.parent = parent;
    this.children = {};
  }

  availableActions(): Action[] {
    return [Action.Call, Action.Fold];
  }
}

export class TerminalNode implements BaseGameTreeNode {
  pot: number;
  lastAction: Action | null;
  parent: GameTreeNode | null;
  children: { [key in Action]?: GameTreeNode };

  constructor(
    pot: number,
    lastAction: Action | null,
    parent: GameTreeNode | null
  ) {
    this.pot = pot;
    this.lastAction = lastAction;
    this.parent = parent;
    this.children = {};
  }

  availableActions(): Action[] {
    return []; // No actions possible in a terminal node
  }
}

export type GameTreeNode = DecisionNode | ResponseNode | TerminalNode;

export class GameTree {
  root: GameTreeNode;

  constructor(pot: number) {
    this.root = this._buildGameTree(new DecisionNode(pot, null, null));
  }

  private _buildGameTree(current: GameTreeNode): GameTreeNode {
    if (current instanceof TerminalNode) {
      return current;
    }

    for (const action of current.availableActions()) {
      let nextNode: GameTreeNode;
      if (action === Action.Bet) {
        nextNode = new ResponseNode(current.pot + 1, action, current);
      } else if (action === Action.Call || action === Action.Fold) {
        nextNode = new TerminalNode(current.pot, action, current);

        // Both Players checked
      } else if (
        current.parent instanceof DecisionNode &&
        action === Action.Check
      ) {
        nextNode = new TerminalNode(current.pot, action, current);
      } else {
        nextNode = new DecisionNode(current.pot, action, current);
      }

      current.children[action] = this._buildGameTree(nextNode);
    }

    return current;
  }
}
