import { CreatePlayer, Player, PlayerAction, PlayerCards } from "./player";

enum State {
  Init,
  SetupGame,
  BuildGameTree,
  PlayGame,
}

export enum Card {
  Jack,
  Queen,
  King,
}

type GameTreeNode = {
  pot: number;
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

type GameState = {
  state: State;

  p1: Player;
  p2: Player;

  gameTreeRoot: GameTreeNode | null;

  loop: () => void;
  startGame: () => void;
  dealCards: () => PlayerCards;
  buildGameTree: (current: GameTreeNode) => void;
  playGame: (current: GameTreeNode) => void;
};

export const gameState: GameState = {
  state: State.SetupGame,

  p1: CreatePlayer("player1"),
  p2: CreatePlayer("player2"),

  gameTreeRoot: null,

  loop() {
    switch (this.state) {
      case State.SetupGame:
        this.startGame();
        break;
      case State.BuildGameTree:
        if (!this.gameTreeRoot) return;
        this.buildGameTree(this.gameTreeRoot);
        console.log("game tree", this.gameTreeRoot);
        this.state = State.PlayGame;
        break;
      case State.PlayGame:
        if (!this.gameTreeRoot) return;
        console.log("Playing game");
        this.playGame(this.gameTreeRoot);
        this.state = State.Init;
        break;
    }
  },

  startGame() {
    console.log("Starting game");

    // Reset any player bets from the previous round.
    this.p1.betAmount = 0;
    this.p2.betAmount = 0;

    // Each player antes 1 chip
    this.p1.bet();
    this.p2.bet();

    this.gameTreeRoot = {
      player: this.p1,
      cards: this.dealCards(),
      pot: this.p1.betAmount + this.p2.betAmount,
      probability: -1, // not sure what this should be for first turn.
      action: null,
      parent: null,
      terminal: false,
      children: {},
    };

    this.state = State.BuildGameTree;
  },

  buildGameTree(current: GameTreeNode) {
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
      if (a === PlayerAction.Bet || a === PlayerAction.Call) {
        current.player.bet();
      }

      const nextPlayer = current.player.id === "player1" ? this.p2 : this.p1;
      const nextPlayerCard = current.cards[nextPlayer.id];
      const nextNode: GameTreeNode = {
        player: nextPlayer,
        cards: current.cards,
        action: a,
        probability: nextPlayer.strategy[nextPlayerCard][a],
        pot: this.p1.betAmount + this.p2.betAmount,
        parent: current,
        terminal: false,
        children: {},
      };
      current.children[a] = nextNode;
      this.buildGameTree(nextNode);
    }
  },

  playGame(current: GameTreeNode) {
    if (current.terminal) {
      if (current.action === PlayerAction.Fold) {
        current.player.chips += current.pot;
      } else {
        // Call or Check
        console.log(
          `P1: ${Card[current.cards.player1]} VS P2: ${
            Card[current.cards.player2]
          }`
        );
        if (current.cards.player1 > current.cards.player2) {
          this.p1.chips += current.pot;
        } else {
          this.p2.chips += current.pot;
        }
      }
      console.log(`P1: ${this.p1.chips}bb | P2: ${this.p2.chips}bb`);
      this.state = State.Init;
      return;
    }
    if (current.action === PlayerAction.Bet) {
      const action = current.player.getActionFacingBet();
      const nextGameNode = current.children[action];
      if (nextGameNode) {
        console.log(current.player.id, action);
        this.playGame(nextGameNode);
      }
    } else {
      const action = current.player.getAction();
      const nextGameNode = current.children[action];
      if (nextGameNode) {
        console.log(current.player.id, action);
        this.playGame(nextGameNode);
      }
    }
  },

  dealCards(): PlayerCards {
    const deck = [Card.Jack, Card.Queen, Card.King];

    return {
      player1: deck.splice(Math.floor(Math.random() * deck.length), 1)[0],
      player2: deck.splice(Math.floor(Math.random() * deck.length), 1)[0],
    };
  },
};
