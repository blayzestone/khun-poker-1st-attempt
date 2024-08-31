import { PlayerAction } from "./constants";
import { Player } from "./player";

export type GameTreeNode = {
  player: Player;
  action: PlayerAction | null;
  probability: number;
  pot: number;
  terminal: boolean; // Game end node
  parent: GameTreeNode | null;
  children: {
    [key in PlayerAction]?: GameTreeNode;
  };
};

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

    const root = {
      player: this.p1,
      pot: 2,
      probability: -1,
      action: null,
      parent: null,
      terminal: false,
      children: {},
    };
    this.root = this.buildGameTree(root, this.p1, this.p2);
  }

  buildGameTree(current: GameTreeNode, p1: Player, p2: Player): GameTreeNode {
    // Put money in the pot
    if (
      current.action === PlayerAction.Bet ||
      current.action === PlayerAction.Call
    ) {
      if (current.parent) {
        current.parent.player.bet++;
        current.pot++;
      }
    }

    if (
      current.action === PlayerAction.Call ||
      current.action === PlayerAction.Fold
    ) {
      current.terminal = true;
      return current;
    }
    if (
      current.parent &&
      current.parent.action === PlayerAction.Check &&
      current.action === PlayerAction.Check
    ) {
      current.terminal = true;
      return current;
    }

    let actions: PlayerAction[] = [];
    if (current.action === PlayerAction.Bet) {
      actions = [PlayerAction.Call, PlayerAction.Fold];
    } else {
      actions = [PlayerAction.Bet, PlayerAction.Check];
    }

    for (const a of actions) {
      const nextNode: GameTreeNode = {
        player: p1,
        action: a,
        pot: current.pot,
        probability: p1.strategy[p1.card][a],
        parent: current,
        terminal: false,
        children: {},
      };
      nextNode.parent = current;
      current.children[a] = this.buildGameTree(nextNode, p2, p1);
    }
    return current;
  }
}
