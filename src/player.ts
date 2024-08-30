import { Card } from "./gameState";

export enum PlayerAction {
  Bet,
  Call,
  Check,
  Fold,
}

export type Player = {
  id: string;
  chips: number;
  card: Card | null;
  getAction(): PlayerAction.Bet | PlayerAction.Check;
  getActionFacingBet(): PlayerAction.Call | PlayerAction.Fold;
};

// TODO: Refactor into classes
export function CreatePlayer(id: string): Player {
  const player: Player = {
    id: id,
    chips: 100,
    card: null,

    getAction() {
      return Math.floor(Math.random() * 2) === 0
        ? PlayerAction.Bet
        : PlayerAction.Check;
    },
    getActionFacingBet() {
      return Math.floor(Math.random() * 2) === 0
        ? PlayerAction.Call
        : PlayerAction.Fold;
    },
  };
  return player;
}
