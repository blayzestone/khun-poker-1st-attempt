import { Player, PlayerAction, PlayerCards } from "./player";

export type GameTreeNode = {
  player: Player;
  cards: PlayerCards;
  action: PlayerAction | null;
  probability: number;
  terminal: boolean; // Game end node
  parent: GameTreeNode | null;
  children: {
    [key in PlayerAction]?: GameTreeNode;
  };
};
