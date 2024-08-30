import { Card, State } from "./constants";
import { GameTreeNode } from "./gameTree";
import { CreatePlayer, Player, PlayerAction, PlayerCards } from "./player";

type GameState = {
  state: State;

  pot: number;

  p1: Player;
  p2: Player;

  gameTreeRoot: GameTreeNode | null;

  loop: () => void;
  startGame: () => void;
  dealCards: () => PlayerCards;
  buildGameTree: (current: GameTreeNode) => void;
  playGame: (current: GameTreeNode) => void;
  resetGame: () => void;
};

export const gameState: GameState = {
  state: State.SetupGame,

  pot: 0,

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
        this.state = State.ResetGame;
        break;
      case State.ResetGame:
        console.log("Reset game");
        this.resetGame();
        this.state = State.Init;
        break;
    }
  },

  startGame() {
    console.log("Starting game");

    // Each player antes 1 chip
    this.p1.bet();
    this.p2.bet();

    this.pot += 2;

    this.gameTreeRoot = {
      player: this.p1,
      cards: this.dealCards(),
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
      const nextPlayer = current.player.id === "player1" ? this.p2 : this.p1;
      const nextPlayerCard = current.cards[nextPlayer.id];
      const nextNode: GameTreeNode = {
        player: nextPlayer,
        cards: current.cards,
        action: a,
        probability: nextPlayer.strategy[nextPlayerCard][a],
        parent: current,
        terminal: false,
        children: {},
      };
      current.children[a] = nextNode;
      this.buildGameTree(nextNode);
    }
  },

  playGame(current: GameTreeNode) {
    // Handle betting
    if (
      current.action === PlayerAction.Bet ||
      current.action === PlayerAction.Call
    ) {
      if (!current.parent) return;
      current.parent?.player.bet();
      this.pot += 1;
    }

    if (current.terminal) {
      if (current.action === PlayerAction.Fold) {
        current.player.chips += this.pot;
      } else {
        if (current.cards.player1 > current.cards.player2) {
          this.p1.chips += this.pot;
        } else {
          this.p2.chips += this.pot;
        }
      }
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

  resetGame() {
    // Reset any player bets from the previous round.
    this.p1.betAmount = 0;
    this.p2.betAmount = 0;

    this.pot = 0;
    this.gameTreeRoot = null;
  },

  dealCards(): PlayerCards {
    const deck = [Card.Jack, Card.Queen, Card.King];

    return {
      player1: deck.splice(Math.floor(Math.random() * deck.length), 1)[0],
      player2: deck.splice(Math.floor(Math.random() * deck.length), 1)[0],
    };
  },
};
