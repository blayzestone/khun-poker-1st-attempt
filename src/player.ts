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
  // Refactor to use class proxy
  card: Card;
  strategy: PlayerStrategy;
  chips: number;

  private _bet: number;
  get bet() {
    return this._bet;
  }
  set bet(amt: number) {
    this._bet += amt;
    this.chips -= amt;
  }

  constructor(id: PlayerID, card: Card) {
    this.id = id;
    this.card = card;
    this.chips = 100;
    this._bet = 0;

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
