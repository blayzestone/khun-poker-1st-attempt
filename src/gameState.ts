import { Card, State } from "./constants";
import { GameTree, GameTreeNode } from "./gameTree";
import { Player } from "./player";

type GameState = {
  state: State;
  gameTree: GameTree | null;

  loop: () => void;
  startGame: () => void;
  dealCards: () => [Card, Card];
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

    console.log(this.gameTree.root);

    this.state = State.Init;
  },

  playGame(current: GameTreeNode) {
    if (!this.gameTree) return;
    return;
  },

  dealCards(): [Card, Card] {
    const deck = [Card.Jack, Card.Queen, Card.King];

    const card1 = deck.splice(Math.floor(Math.random() * deck.length), 1)[0];
    const card2 = deck.splice(Math.floor(Math.random() * deck.length), 1)[0];

    return [card1, card2];
  },
};
