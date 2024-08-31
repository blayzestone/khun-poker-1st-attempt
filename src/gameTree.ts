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

export class GameTree {
  p1: Player;
  p2: Player;
  pot: number;
  root: GameTreeNode;

  constructor(p1: Player, p2: Player) {
    this.p1 = p1;
    this.p2 = p2;

    // Each player antes 1
    this.p1.bet++;
    this.p2.bet++;

    this.pot = this.p1.bet + this.p2.bet;

    // this.root = this.buildGameTree(null, this.p1, this.p2);

    this.root = {
      player: this.p1,
      probability: -1,
      action: null,
      parent: null,
      terminal: false,
      children: {},
    };

    this.buildGameTree(this.root, this.p1, this.p2);
  }

  buildGameTree(current: GameTreeNode, p1: Player, p2: Player) {
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
      //   const nextPlayer = current.player.id === "player1" ? this.p2 : this.p1;
      const nextNode: GameTreeNode = {
        player: p1,
        action: a,
        probability: p1.strategy[p1.card][a],
        parent: current,
        terminal: false,
        children: {},
      };
      current.children[a] = nextNode;
      this.buildGameTree(nextNode, p2, p1);
    }
  }

  //   buildGameTree(
  //     action: PlayerAction | null,
  //     p1: Player,
  //     p2: Player
  //   ): GameTreeNode {
  //     let actions: PlayerAction[] = [];
  //     let nextAction = p1.getAction();
  //     if (action === PlayerAction.Bet) {
  //       actions = [PlayerAction.Call, PlayerAction.Fold];
  //       nextAction = p1.getActionFacingBet();
  //     } else {
  //       actions = [PlayerAction.Bet, PlayerAction.Check];
  //     }
  //     const p = action ? p1.strategy[p1.card][action] : -1;
  //     const node: GameTreeNode = {
  //       player: p1,
  //       action: action,
  //       probability: p,
  //       parent: null,
  //       terminal: false,
  //       children: {},
  //     };
  //     if (
  //       node.action === PlayerAction.Call ||
  //       node.action === PlayerAction.Fold
  //     ) {
  //       node.terminal = true;
  //       return node;
  //     }
  //     if (
  //       node.parent &&
  //       node.parent.action === PlayerAction.Check &&
  //       node.action === PlayerAction.Check
  //     ) {
  //       node.terminal = true;
  //       return node;
  //     }

  //     for (const a of actions) {
  //       const nextNode = this.buildGameTree(a, p2, p1);
  //       node.children[a] = nextNode;
  //     }
  //     return node;
  //   }
}
