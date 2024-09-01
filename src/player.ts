import { Action, Card } from "./constants";

export type PlayerID = "player1" | "player2";

type PlayerStrategy = {
  [key in Card]: {
    [key in Action]: number;
  };
};

export type PlayerCards = {
  [key in PlayerID]: Card;
};

export class Player {
  id: PlayerID;
  strategy: PlayerStrategy;
  chips: number;
  bet: number;

  constructor(id: PlayerID) {
    this.id = id;
    this.chips = 100;
    this.bet = 0;

    this.strategy = {
      [Card.Jack]: {
        [Action.Bet]: 0.5,
        [Action.Call]: 0.5,
        [Action.Check]: 0.5,
        [Action.Fold]: 0.5,
      },
      [Card.Queen]: {
        [Action.Bet]: 0.5,
        [Action.Call]: 0.5,
        [Action.Check]: 0.5,
        [Action.Fold]: 0.5,
      },
      [Card.King]: {
        [Action.Bet]: 0.5,
        [Action.Call]: 0.5,
        [Action.Check]: 0.5,
        [Action.Fold]: 0.5,
      },
    };
  }

  getAction(actions: Action[]) {
    return actions[Math.floor(Math.random() * actions.length)];
  }
}
