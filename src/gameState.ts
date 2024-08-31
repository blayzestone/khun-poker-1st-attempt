import { Card, PlayerAction, State } from "./constants";
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
        console.log(this.gameTree.root);
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
    if (!this.gameTree) return;

    if (current.action) {
      console.log(current.player.id, current.action);
    }
    if (current.terminal) {
      console.log("hand ended:");
      this.state = State.Init;
      return;
    }

    let action = current.player.getAction();
    if (current.action === PlayerAction.Bet) {
      action = current.player.getActionFacingBet();
    }
    const nextGameNode = current.children[action];
    if (nextGameNode) {
      this.playGame(nextGameNode);
    }
    return;
  },

  dealCards(): [Card, Card] {
    const deck = [Card.Jack, Card.Queen, Card.King];

    const card1 = deck.splice(Math.floor(Math.random() * deck.length), 1)[0];
    const card2 = deck.splice(Math.floor(Math.random() * deck.length), 1)[0];

    return [card1, card2];
  },
};
