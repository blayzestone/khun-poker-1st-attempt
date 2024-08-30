import { Card } from "./gameState";

export enum PlayerAction {
  Bet = "bet",
  Call = "call",
  Check = "check",
  Fold = "fold",
}
type PlayerID = "player1" | "player2";

type PlayerStrategy = {
  [key in Card]: {
    [key in PlayerAction]: number;
  };
};

export type Player = {
  id: PlayerID;
  chips: number;
  // Refactor to use class proxy
  betAmount: number;
  strategy: PlayerStrategy;
  getAction(): PlayerAction.Bet | PlayerAction.Check;
  getActionFacingBet(): PlayerAction.Call | PlayerAction.Fold;
  bet(): void;
};

export type PlayerCards = {
  [key in PlayerID]: Card;
};

// TODO: Refactor into classes
export function CreatePlayer(id: PlayerID): Player {
  const player: Player = {
    id,
    chips: 100,
    betAmount: 0,
    strategy: {
      [Card.Jack]: {
        [PlayerAction.Bet]: 0.5,
        [PlayerAction.Call]: 0.5,
        [PlayerAction.Check]: 0.5,
        [PlayerAction.Fold]: 0.5,
      },
      [Card.Queen]: {
        [PlayerAction.Bet]: 0.5,
        [PlayerAction.Call]: 0.5,
        [PlayerAction.Check]: 0.5,
        [PlayerAction.Fold]: 0.5,
      },
      [Card.King]: {
        [PlayerAction.Bet]: 0.5,
        [PlayerAction.Call]: 0.5,
        [PlayerAction.Check]: 0.5,
        [PlayerAction.Fold]: 0.5,
      },
    },
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
    bet() {
      this.chips--;
      this.betAmount++;
    },
  };
  return player;
}
