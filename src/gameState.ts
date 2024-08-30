import { CreatePlayer, Player, PlayerAction } from "./player";

enum State {
  Init,
  Start,
  Action,
  WaitingAction,
  Showdown,
}

export enum Card {
  Jack,
  Queen,
  King,
}

type GameTreeNode = {
  player: Player;
  action: PlayerAction | null;
  probability: number;
  payoff: [number, number];
  parent: GameTreeNode | null;
  children: {
    [key in PlayerAction]?: GameTreeNode;
  };
};

type GameState = {
  state: State;
  pot: number;

  p1: Player;
  p2: Player;

  gameTreeRoot: GameTreeNode | null;

  loop: () => void;
  startGame: () => void;
  dealCards: () => void;
  showdown: () => void;
  buildGameTree: (current: GameTreeNode) => void;
  awardPot: (p: Player) => void;
  playerBet: (p: Player) => void;
};

export const gameState: GameState = {
  state: State.Start,
  pot: 0,

  p1: CreatePlayer("player1"),
  p2: CreatePlayer("player2"),

  gameTreeRoot: null,

  loop() {
    switch (this.state) {
      case State.Start:
        this.startGame();
        break;
      case State.Action:
        if (!this.gameTreeRoot) return;
        this.buildGameTree(this.gameTreeRoot);
        console.log("game tree", this.gameTreeRoot);
        this.state = State.WaitingAction;
        break;
      case State.Showdown:
        this.showdown();
        break;
    }
  },

  startGame() {
    console.log("Starting game");

    this.dealCards();

    // Ante
    this.p1.chips--;
    this.p2.chips--;
    this.pot += 2;

    this.gameTreeRoot = {
      player: this.p1,
      payoff: [0, 0],
      probability: -1, // not sure what this should be for first turn.
      action: null,
      parent: null,
      children: {},
    };

    this.state = State.Action;
  },

  buildGameTree(current: GameTreeNode) {
    if (current.action === PlayerAction.Call) {
      if (this.p1.card === null || this.p2.card === null) return;
      // Need to compare cards to determine who gets the payoff
      if (this.p1.card > this.p2.card) {
        current.payoff = [this.pot, 0];
      } else {
        current.payoff = [0, this.pot];
      }
      return;
    }
    if (current.action === PlayerAction.Fold) {
      // Set payoff values based to whoever didnt fold
      if (current.player.id === "player1") {
        current.payoff = [this.pot, 0];
      } else {
        current.payoff = [0, this.pot];
      }
      return;
    }
    // If both players have checked, go to showdown
    if (
      current.parent &&
      current.parent.action === PlayerAction.Check &&
      current.action === PlayerAction.Check
    ) {
      if (this.p1.card === null || this.p2.card === null) return;
      // Need to compare cards to determine who gets the payoff
      if (this.p1.card > this.p2.card) {
        current.payoff = [this.pot, 0];
      } else {
        current.payoff = [0, this.pot];
      }
      return;
    }

    const player = current.player.id === "player1" ? this.p2 : this.p1;
    let actions: PlayerAction[] = [];
    if (current.action === PlayerAction.Bet) {
      actions = [PlayerAction.Call, PlayerAction.Fold];
    } else {
      actions = [PlayerAction.Bet, PlayerAction.Check];
    }

    if (player.card === null) return;

    for (const a of actions) {
      const nextNode: GameTreeNode = {
        player: player,
        action: a,
        probability: player.strategy[player.card][a],
        payoff: [0, 0],
        parent: current,
        children: {},
      };
      current.children[a] = nextNode;
      this.buildGameTree(nextNode);
    }
  },

  dealCards() {
    const deck = [Card.Jack, Card.Queen, Card.King];

    const card1 = deck.splice(Math.floor(Math.random() * deck.length), 1)[0];
    const card2 = deck.splice(Math.floor(Math.random() * deck.length), 1)[0];

    console.log("deal cards");

    this.p1.card = card1;
    this.p2.card = card2;
  },

  showdown() {
    if (this.p1.card === null || this.p2.card === null) return;

    console.log(`P1: ${Card[this.p1.card]} VS P2: ${Card[this.p2.card]}`);

    if (this.p1.card > this.p2.card) {
      console.log("Player #1 wins!");
      this.awardPot(this.p1);
    } else {
      console.log("Player #2 wins!");
      this.awardPot(this.p2);
    }
  },

  awardPot(p: Player) {
    p.chips += this.pot;
    this.pot = 0;

    console.log(`P1: ${this.p1.chips}bb | P2: ${this.p2.chips}bb`);

    this.state = State.Init;
  },

  playerBet(p: Player) {
    p.chips -= 1;
    this.pot += 1;
  },
};
