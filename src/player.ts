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
        [Action.Bet]: 0,
        [Action.Call]: 0,
        [Action.Check]: 1,
        [Action.Fold]: 1,
      },
      [Card.Queen]: {
        [Action.Bet]: 0,
        [Action.Call]: 1,
        [Action.Check]: 1,
        [Action.Fold]: 0,
      },
      [Card.King]: {
        [Action.Bet]: 1,
        [Action.Call]: 1,
        [Action.Check]: 0,
        [Action.Fold]: 0,
      },
    };
  }

  getAction(card: Card, actions: Action[]) {
    const rng = Math.random();
    let sum = 0;
    for (const action of actions) {
      console.log(
        "rng:",
        rng.toFixed(2),
        "sum:",
        sum.toFixed(2),
        "action pct:",
        this.strategy[card][action]
      );
      if (rng < this.strategy[card][action] + sum) {
        console.log("action", action);
        return action;
      }
      sum += this.strategy[card][action];
    }
  }
}
