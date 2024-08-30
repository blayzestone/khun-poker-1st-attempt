import { Card } from "./gameState";

export enum PlayerAction {
  Bet = "bet",
  Call = "call",
  Check = "check",
  Fold = "fold",
}

type PlayerStrategy = {
  [key in Card]: {
    [key in PlayerAction]: number;
  };
};

export type Player = {
  id: string;
  chips: number;
  card: Card | null;
  strategy: PlayerStrategy;
  getAction(): PlayerAction.Bet | PlayerAction.Check;
  getActionFacingBet(): PlayerAction.Call | PlayerAction.Fold;
};

// TODO: Refactor into classes
export function CreatePlayer(id: string): Player {
  const player: Player = {
    id: id,
    chips: 100,
    card: null,
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
  };
  return player;
}
