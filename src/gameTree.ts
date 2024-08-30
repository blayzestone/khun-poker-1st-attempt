import { PlayerAction } from "./constants";
import { Player } from "./player";

export type GameTreeNode = {
  player: Player;
  action: PlayerAction | null;
  probability: number;
  terminal: boolean; // Game end node
  parent: GameTreeNode | null;
  children: {
    [key in PlayerAction]?: GameTreeNode;
  };
};

class GameTree {
  p1: Player;
  p2: Player;
  pot: number;
  root: GameTreeNode;

  constructor(p1: Player, p2: Player) {
    this.p1 = p1;
    this.p2 = p2;
    this.pot = 0;
    this.root = {
      player: this.p1,
      probability: -1,
      action: null,
      parent: null,
      terminal: false,
      children: {},
    };

    this.buildGameTree(this.root);
  }

  buildGameTree(current: GameTreeNode) {
    if (
      current.action === PlayerAction.Call ||
      current.action === PlayerAction.Fold
    ) {
      current.terminal = true;
      return;
    }
    if (
      current.parent &&
      current.parent.action === PlayerAction.Check &&
      current.action === PlayerAction.Check
    ) {
      current.terminal = true;
      return;
    }

    let actions: PlayerAction[] = [];
    if (current.action === PlayerAction.Bet) {
      actions = [PlayerAction.Call, PlayerAction.Fold];
    } else {
      actions = [PlayerAction.Bet, PlayerAction.Check];
    }

    for (const a of actions) {
      const nextPlayer = current.player.id === "player1" ? this.p2 : this.p1;
      const nextNode: GameTreeNode = {
        player: nextPlayer,
        action: a,
        probability: nextPlayer.strategy[nextPlayer.card][a],
        parent: current,
        terminal: false,
        children: {},
      };
      current.children[a] = nextNode;
      this.buildGameTree(nextNode);
    }
  }
}
