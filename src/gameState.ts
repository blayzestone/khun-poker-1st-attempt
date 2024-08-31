import { Card, State } from "./constants";
import { GameTree, GameTreeNode } from "./gameTree";
import { Player } from "./player";

type GameState = {
  state: State;
  gameTree: GameTree | null;

  loop: () => void;
  startGame: () => void;
  dealCards: () => [Card, Card];
  //   buildGameTree: (current: GameTreeNode) => void;
  playGame: (current: GameTreeNode) => void;
};

export const gameState: GameState = {
  state: State.SetupGame,
  gameTree: null,

  loop() {
    switch (this.state) {
      case State.SetupGame:
        this.startGame();
        break;
      case State.PlayGame:
        if (!this.gameTree) return;
        console.log("Playing game");
        this.playGame(this.gameTree.root);
        this.state = State.Init;
        break;
    }
  },

  startGame() {
    console.log("Starting game");

    const [card1, card2] = this.dealCards();

    const p1 = new Player("player1", card1);
    const p2 = new Player("player2", card2);

    this.gameTree = new GameTree(p1, p2);

    this.state = State.PlayGame;
  },

  playGame(current: GameTreeNode) {
    console.log(current);
    return;
    // Handle betting
    // if (
    //   current.action === PlayerAction.Bet ||
    //   current.action === PlayerAction.Call
    // ) {
    //   if (!current.parent) return;
    //   current.parent?.player.bet();
    //   this.pot += 1;
    // }

    // if (current.terminal) {
    //   if (current.action === PlayerAction.Fold) {
    //     current.player.chips += this.pot;
    //   } else {
    //     if (current.cards.player1 > current.cards.player2) {
    //       this.p1.chips += this.pot;
    //     } else {
    //       this.p2.chips += this.pot;
    //     }
    //   }
    //   this.state = State.Init;
    //   return;
    // }
    // if (current.action === PlayerAction.Bet) {
    //   const action = current.player.getActionFacingBet();
    //   const nextGameNode = current.children[action];
    //   if (nextGameNode) {
    //     console.log(current.player.id, action);
    //     this.playGame(nextGameNode);
    //   }
    // } else {
    //   const action = current.player.getAction();
    //   const nextGameNode = current.children[action];
    //   if (nextGameNode) {
    //     console.log(current.player.id, action);
    //     this.playGame(nextGameNode);
    //   }
    // }
  },

  dealCards(): [Card, Card] {
    const deck = [Card.Jack, Card.Queen, Card.King];

    const card1 = deck.splice(Math.floor(Math.random() * deck.length), 1)[0];
    const card2 = deck.splice(Math.floor(Math.random() * deck.length), 1)[0];

    return [card1, card2];
  },
};
