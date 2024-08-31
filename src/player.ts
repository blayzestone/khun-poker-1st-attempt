import { Card, PlayerAction } from "./constants";

export type PlayerID = "player1" | "player2";

type PlayerStrategy = {
  [key in Card]: {
    [key in PlayerAction]: number;
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

  private _chips: number;
  get chips() {
    return this._chips;
  }
  private _bet: number;
  get bet() {
    return this._bet;
  }
  set bet(amt: number) {
    this._bet += amt;
    this._chips -= amt;
  }

  constructor(id: PlayerID, card: Card) {
    this.id = id;
    this.card = card;
    this._chips = 100;
    this._bet = 0;

    this.strategy = {
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
    };
  }

  getAction(actions: PlayerAction[]) {
    return actions[Math.floor(Math.random() * actions.length)];
  }
}
